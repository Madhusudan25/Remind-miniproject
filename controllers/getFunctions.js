const passport = require("passport");
const quotes = require("quotesy");
const {
  User,
  Faculty,
  Student,
  Item,
  AssignmentModel,
  CustomListModel,
} = require("../models/models");
var moment = require("moment");

const lodash = require("lodash");

function home(req, res) {
  var quote = quotes.random();
  res.render("home", { quote_author: quote.author, quote_text: quote.text });
}

function facultyLogin(req, res) {
  res.render("login", { usertype: "faculty" });
}

function facultyRegister(req, res) {
  res.render("faculty-register");
}

function studentLogin(req, res) {
  res.render("login", { message: "", usertype: "student" });
}

function studentRegister(req, res) {
  res.render("student-register", { message: "" });
}

function callingAuth(req, res, next) {
  GLOBAL_USER = req.params.usertype;
  GLOBAL_METHOD = req.params.method;
  console.log(GLOBAL_USER);
  console.log(GLOBAL_METHOD);
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
}

function authCallback(req, res) {
  console.log(req.user.googleId);
  User.findOne({ googleId: req.user.googleId }, (err, foundUser) => {
    if (err) {
      console.log("Error is found");
    } else {
      if (foundUser) {
        res.redirect("/" + GLOBAL_USER + "/" + foundUser._id);
      }
    }
  });
}

function logout(req, res) {
  req.logout();
  res.redirect("/");
}

function postBackFacultyContent(req, res) {
  console.log(req.params.id);
  var students;
  Student.find({}, (err, foundStudent) => {
    if (err) {
      console.log(err);
    } else {
      students = foundStudent;
    }
  });
  Faculty.findOne({ _id: req.params.id }, (err, found) => {
    if (!err) {
      if (found) {
        const temp = {
          name: found.name,
          profilePic: found.profilePic,
          facultySchedule: found.facultySchedule,
          subject: found.subject,
          postedAssignment: found.postedAssignment,
          customLists: found.customLists,
          studentList: students,
        };
        // console.log(temp);
        res.status(200).json({ data: temp });
      }
    } else {
      console.log(err);
      res.status(500).send("Unable to perform required operation!");
    }
  });
}

function facultyWorkSceduleHandler(req, res) {
  const task = lodash.capitalize(req.body.listItem);
  const newItem = new Item({
    name: task,
  });
  Faculty.findOne({ _id: req.params.id }, (err, foundFaculty) => {
    if (!err) {
      if (foundFaculty) {
        foundFaculty.facultySchedule.push(newItem);
        foundFaculty.save();
        res
          .status(200)
          .json({ item_id: newItem._id, description: newItem.name });
      }
    } else {
      res.status(500).send("Database error");
    }
  });
}

function facultyWorkScheduleDeleteHandler(req, res) {
  const id = req.params.id;
  Faculty.findOneAndUpdate(
    { _id: id },
    { $pull: { facultySchedule: { _id: req.body.array_id } } },
    function (err, foundItem) {
      if (!err) {
        Faculty.findOne({ _id: id }, (err, found) => {
          if (!err) {
            if (found) {
              const workScheduleListItems = found.facultySchedule;
              res.status(200).json({ array: workScheduleListItems });
            }
          }
        });
      } else {
        res.status(500).send("Database deletion not performed!!Error");
      }
    }
  );
}

function handleNewAssignment(req, res) {
  var postAssignmentData = req.body;

  Faculty.findOne({ _id: req.params.id }, async (err, foundUser) => {
    if (err) {
      res.status(500).send("There was an error");
    } else {
      if (!foundUser) {
        res.status(500).send("No user with that id found");
      } else {
        var data = new AssignmentModel({
          description: lodash.capitalize(postAssignmentData.description),
          subject: lodash.capitalize(postAssignmentData.subject),
          deadline: moment.utc(postAssignmentData.deadline).format(),
          postedTime: moment.utc(postAssignmentData.postedAt).format(),
          studentList: postAssignmentData.students,
        });

        foundUser.postedAssignment.push(data);
        await foundUser.save();
        console.log(data.studentList);

        Student.find(
          {
            _id: { $in: data.studentList },
          },
          function (err, foundStudents) {
            if (err) {
              res.status(500).send("Cannot perform operation");
            } else {
              if (foundStudents) {
                console.log(foundStudents);
                console.log(data);
                foundStudents.forEach((student) => {
                  student.givenAssignment.push(data);
                  student.save();
                });
                res.status(200).json({ data: data });
              } else {
                res.status(500).send("Cannot perform operation");
              }
            }
          }
        );
      }
    }
  });
}

function handleNewListCreation(req, res) {
  var id = req.params.id;
  var listname = lodash.capitalize(req.body.listName);

  Faculty.findOne({ _id: id }, (err, foundFaculty) => {
    if (!err) {
      if (foundFaculty) {
        for (let i = 0; i < foundFaculty.customLists.length; i++) {
          const list = foundFaculty.customLists[i];
          if (list.listName === listname) {
            res
              .status(500)
              .send("ListName already exists..Please try with another name!!");
            return false;
          }
        }
        var newList = new CustomListModel({
          listName: listname,
        });
        foundFaculty.customLists.push(newList);
        foundFaculty.save();
        res.status(200).json({ newList: newList });
      }
    }
  });
}

function handleNewItemInsertionCustomList(req, res) {
  console.log(req.body);
  var listname = req.body.listname;
  var facultyId = req.params.id;
  var listId = req.body.listId;
  Faculty.findOne({ _id: facultyId }, (err, foundFaculty) => {
    if (err) {
      console.log(err);
    } else {
      if (foundFaculty) {
        for (let i = 0; i < foundFaculty.customLists.length; i++) {
          const list = foundFaculty.customLists[i];
          if (list.listName === listname) {
            var newItem = new Item({
              name: lodash.capitalize(req.body.description),
            });
            list.description.push(newItem);
            foundFaculty.save();
            var frontEndUlId = listname + listId;

            console.log(frontEndUlId);
            res.status(200).json({
              ulId: frontEndUlId,
              listName: listname,
              itemId: newItem._id,
              description: newItem.name,
            });
          }
        }
      } else {
        res.status(500).send("Unable to perform required operation!");
      }
    }
  });
}

function customListDeleteHandler(req, res) {
  var listName = req.body.listName;
  var itemId = req.body.itemId;
  var facultyId = req.params.id;

  Faculty.findOne({ _id: facultyId }, async (err, foundFaculty) => {
    if (err) {
      console.log(err);
    } else {
      if (foundFaculty) {
        for (let i = 0; i < foundFaculty.customLists.length; i++) {
          const list = foundFaculty.customLists[i];
          if (list.listName === listName) {
            list.description = list.description.filter(function (
              value,
              index,
              arr
            ) {
              return value._id != itemId;
            });
          }
          // console.log(list.description);
        }
        await foundFaculty.save();
      } else {
        res.status(500).send("Unable to perform required operation!");
      }

      Faculty.findOne({ _id: facultyId }, (error, foundUser) => {
        if (!error) {
          if (foundUser) {
            for (let i = 0; i < foundUser.customLists.length; i++) {
              const getlist = foundUser.customLists[i];
              if (getlist.listName === listName) {
                res.status(200).json({
                  listName: getlist.listName,
                  listId: getlist._id,
                  description: getlist.description,
                });
              }
            }
          } else {
            res.status(500).send("Unable to perform required operation!");
          }
        } else {
          res.status(500).send("Unable to perform required operation!");
        }
      });
    }
  });
}

function addSubject(req, res) {
  Faculty.findOne({ _id: req.params.id }, async (err, found) => {
    if (err) {
      res.status(500).send("Error occured!Cannot add subject!");
    } else {
      if (!found) {
        res.status(500).send("Faculty not found!");
      } else {
        found.subject = lodash.capitalize(req.body.subject);
        await found.save();
        res.status(200).json({
          message: "Successfully added the subject",
          subject: found.subject,
        });
      }
    }
  });
}

function listDeletion(req, res) {
  var listName = req.body.listName;
  var listId = req.body.listId;

  console.log(listName + listId);

  Faculty.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { customLists: { _id: listId } } },
    function (err, foundItem) {
      if (!err) {
        Faculty.findOne({ _id: req.params.id }, (err, found) => {
          if (!err) {
            if (found) {
              const customLists = found.customLists;
              res.status(200).json({ array: customLists });
            }
          }
        });
      } else {
        res.status(500).send("Database deletion not performed!!Error");
      }
    }
  );
}

function studentWorkSceduleHandler(req, res) {
  const task = lodash.capitalize(req.body.listItem);
  const newItem = new Item({
    name: task,
  });
  Student.findOne({ _id: req.params.id }, (err, foundStudent) => {
    if (!err) {
      if (foundStudent) {
        foundStudent.studentSchedule.push(newItem);
        foundStudent.save();
        res
          .status(200)
          .json({ item_id: newItem._id, description: newItem.name });
      }
    } else {
      res.status(500).send("Database error");
    }
  });
}

function studentWorkScheduleDeleteHandler(req, res) {
  const id = req.params.id;
  Student.findOneAndUpdate(
    { _id: id },
    { $pull: { studentSchedule: { _id: req.body.array_id } } },
    function (err, foundItem) {
      if (!err) {
        Student.findOne({ _id: id }, (err, found) => {
          if (!err) {
            if (found) {
              const workScheduleListItems = found.studentSchedule;
              res.status(200).json({ array: workScheduleListItems });
            }
          }
        });
      } else {
        res.status(500).send("Database deletion not performed!!Error");
      }
    }
  );
}

function studentHandleNewListCreation(req, res) {
  var id = req.params.id;
  var listname = lodash.capitalize(req.body.listName);
  Student.findOne({ _id: id }, (err, foundStudent) => {
    if (!err) {
      if (foundStudent) {
        for (let i = 0; i < foundStudent.customLists.length; i++) {
          const list = foundStudent.customLists[i];
          if (list.listName === listname) {
            res
              .status(500)
              .send("ListName already exists..Please try with another name!!");
            return false;
          }
        }
        var newList = new CustomListModel({
          listName: listname,
        });
        foundStudent.customLists.push(newList);
        foundStudent.save();
        res.status(200).json({ newList: newList });
      }
    }
  });
}

function studentHandleNewItemInsertionCustomList(req, res) {
  console.log(req.body);
  var listname = req.body.listname;
  var studentId = req.params.id;
  var listId = req.body.listId;
  Student.findOne({ _id: studentId }, (err, foundStudent) => {
    if (err) {
      console.log(err);
    } else {
      if (foundStudent) {
        for (let i = 0; i < foundStudent.customLists.length; i++) {
          const list = foundStudent.customLists[i];
          if (list.listName === listname) {
            var newItem = new Item({
              name: lodash.capitalize(req.body.description),
            });
            list.description.push(newItem);
            foundStudent.save();
            var frontEndUlId = listname + listId;

            console.log(frontEndUlId);
            res.status(200).json({
              ulId: frontEndUlId,
              listName: listname,
              itemId: newItem._id,
              description: newItem.name,
            });
          }
        }
      } else {
        res.status(500).send("Unable to perform required operation!");
      }
    }
  });
}

function studentCustomListDeleteHandler(req, res) {
  var listName = req.body.listName;
  var itemId = req.body.itemId;
  var studentId = req.params.id;

  Student.findOne({ _id: studentId }, async (err, foundStudent) => {
    if (err) {
      console.log(err);
    } else {
      if (foundStudent) {
        for (let i = 0; i < foundStudent.customLists.length; i++) {
          const list = foundStudent.customLists[i];
          if (list.listName === listName) {
            list.description = list.description.filter(function (
              value,
              index,
              arr
            ) {
              return value._id != itemId;
            });
          }
          // console.log(list.description);
        }
        await foundStudent.save();
      } else {
        res.status(500).send("Unable to perform required operation!");
      }

      Student.findOne({ _id: studentId }, (error, foundUser) => {
        if (!error) {
          if (foundUser) {
            for (let i = 0; i < foundUser.customLists.length; i++) {
              const getlist = foundUser.customLists[i];
              if (getlist.listName === listName) {
                res.status(200).json({
                  listName: getlist.listName,
                  listId: getlist._id,
                  description: getlist.description,
                });
              }
            }
          } else {
            res.status(500).send("Unable to perform required operation!");
          }
        } else {
          res.status(500).send("Unable to perform required operation!");
        }
      });
    }
  });
}

function postBackStudentContent(req, res) {
  Student.findOne({ _id: req.params.id }, (err, found) => {
    if (!err) {
      if (found) {
        const temp = {
          name: found.name,
          profilePic: found.profilePic,
          studentSchedule: found.studentSchedule,
          givenAssignment: found.givenAssignment,
          customLists: found.customLists,
        };
        // console.log(temp);
        res.status(200).json({ data: temp });
      }
    } else {
      console.log(err);
      res.status(500).send("Unable to perform required operation!");
    }
  });
}

function deleteAssignment(req, res) {
  var studentId = req.params.id;
  var assignmentId = req.body.id;

  console.log("Hskdfjewufjhdnf");
  Student.findOneAndUpdate(
    { _id: studentId },
    { $pull: { givenAssignment: { _id: assignmentId } } },
    function (err, foundItem) {
      if (!err) {
        Student.findOne({ _id: studentId }, (err, found) => {
          if (!err) {
            if (found) {
              const assignments = found.givenAssignment;
              // console.log(assignments);
              res.status(200).json({ assignments: assignments });
            }
          }
        });
      } else {
        res.status(500).send("Database deletion not performed!!Error");
      }
    }
  );
}

function deleteStudentCustomList(req, res) {
  var listName = req.body.listName;
  var listId = req.body.listId;

  console.log(listName + listId);

  Student.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { customLists: { _id: listId } } },
    function (err, foundItem) {
      if (!err) {
        Student.findOne({ _id: req.params.id }, (err, found) => {
          if (!err) {
            if (found) {
              const customLists = found.customLists;
              res.status(200).json({ array: customLists });
            }
          }
        });
      } else {
        res.status(500).send("Database deletion not performed!!Error");
      }
    }
  );
}
module.exports = {
  home,
  facultyLogin,
  facultyRegister,
  studentLogin,
  studentRegister,
  callingAuth,
  authCallback,
  logout,
  facultyWorkSceduleHandler,
  facultyWorkScheduleDeleteHandler,
  handleNewAssignment,
  handleNewListCreation,
  handleNewItemInsertionCustomList,
  customListDeleteHandler,
  postBackFacultyContent,
  addSubject,
  listDeletion,

  studentWorkSceduleHandler,
  studentWorkScheduleDeleteHandler,
  studentHandleNewListCreation,
  studentHandleNewItemInsertionCustomList,
  studentCustomListDeleteHandler,
  postBackStudentContent,
  deleteAssignment,
  deleteStudentCustomList,
};
