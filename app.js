//jshint esversion:6
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const models = require("./models/models.js");

const app = express();
dotenv.config();

const postRoutes = require("./routes/routes");

GLOBAL_USER = "";
USER_TYPE_IN_DB = "";
GLOBAL_METHOD = "";

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", postRoutes);

// mongoose.connect("mongodb://localhost:27017/userDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// });

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.z15mm.mongodb.net/remindDB`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

const User = models.User;
const Faculty = models.Faculty;
const Student = models.Student;

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//LEVEL 6 OAUTH
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://remind-fs.herokuapp.com/auth/google/secure",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log(profile._json.email);
      User.findOne(
        { username: profile._json.email },
        async function (err, foundUser) {
          if (err) {
            console.log("Error1");
            console.log(err);
          } else {
            if (GLOBAL_METHOD == "register") {
              if (!foundUser) {
                var newUser = new User({
                  googleId: profile.id,
                  username: profile._json.email,
                  name: profile._json.name,
                  profilePic: profile._json.picture,
                  type: GLOBAL_USER,
                });
                await newUser.save();
                if (newUser.type == "faculty") {
                  var faculty = new Faculty({
                    _id: newUser._id,
                    googleId: newUser.googleId,
                    username: newUser.username,
                    name: newUser.name,
                    profilePic: newUser.profilePic,
                  });
                  await faculty.save();
                } else {
                  var student = new Student({
                    _id: newUser._id,
                    googleId: newUser.googleId,
                    username: newUser.username,
                    name: newUser.name,
                    profilePic: newUser.profilePic,
                  });
                  await student.save();
                }

                console.log("ABCDEFGHIJKLMNOP");
                return done(err, newUser);
              } else {
                USER_TYPE_IN_DB = foundUser.type;
                return done(null, false);
              }
            } else {
              if (!foundUser) {
                USER_TYPE_IN_DB = GLOBAL_USER;
                return done(null, false);
              } else {
                if (
                  foundUser.type == GLOBAL_USER &&
                  foundUser.googleId != null
                ) {
                  return done(null, foundUser);
                }
                return done(null, false);
              }
            }
          }
        }
      );
    }
  )
);

app.post("/faculty/register", function (req, res) {
  GLOBAL_USER = req.body.usertype;
  User.register(
    {
      username: req.body.username,
      name: req.body.name,
      subject: req.body.subject,
      type: req.body.usertype,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(409).send("Username Already exists");
      } else {
        passport.authenticate("local", { failureRedirect: "/userExists" })(
          req,
          res,
          async function () {
            var newFaculty = new Faculty({
              _id: user._id,
              username: req.body.username,
              name: req.body.name,
              subject: req.body.subject,
            });
            await newFaculty.save(function (err, result) {
              if (err) {
                console.log(err);
              }
            });
            res.status(200).json({ url: "/faculty/" + user._id });
          }
        );
      }
    }
  );
});

app.post("/student/register", function (req, res) {
  GLOBAL_USER = req.body.usertype;
  User.register(
    {
      username: req.body.username,
      name: req.body.name,
      type: req.body.usertype,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(409).send("Username Already exists");
      } else {
        passport.authenticate("local", { failureRedirect: "/userExists" })(
          req,
          res,
          async function () {
            var newStudent = new Student({
              _id: user._id,
              username: req.body.username,
              name: req.body.name,
            });
            await newStudent.save(function (err, result) {
              if (err) {
                console.log(err);
              }
            });
            res.status(200).json({ url: "/student/" + user._id });
          }
        );
      }
    }
  );
});

app.post("/login", function (req, res) {
  console.log(req.body);
  GLOBAL_USER = req.body.usertype;
  User.findOne({ username: req.body.username }, function (err, foundUser) {
    if (!err) {
      if (foundUser) {
        if (foundUser.type === req.body.usertype) {
          const user = new User({
            username: req.body.username,
            password: req.body.password,
          });
          req.login(user, function (err) {
            // this method comes from passport For further info read documentation
            if (err) {
              console.log(err);
            } else {
              passport.authenticate("local", { failureRedirect: "/UserError" })(
                req,
                res,
                function () {
                  // console.log(req);
                  res
                    .status(200)
                    .json({ url: `${GLOBAL_USER}/${foundUser._id}` });
                }
              );
            }
          });
        } else {
          res
            .status(409)
            .send("No user found in " + req.body.usertype + " type");
        }
      } else {
        res.status(409).send("No user found");
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (req, res) {
  console.log("Server started at port 3000");
});
