const express = require("express");
const passport = require("passport");
const actions = require("../controllers/getFunctions");
const { Faculty, Student } = require("../models/models");

const router = express();

router.get("/", actions.home);

router.get("/faculty", actions.facultyLogin);

router.get("/faculty/register", actions.facultyRegister);

router.get("/student", actions.studentLogin);

router.get("/student/register", actions.studentRegister);

router.get("/:usertype/:method/auth/google", actions.callingAuth);

router.get(
  "/auth/google/secure",
  passport.authenticate("google", { failureRedirect: "/error" }),
  actions.authCallback
);

router.get("/error", (req, res) => {
  res.render("error");
});

router.get("/UserError", function (req, res) {
  res.status(400).send("Invalid Username or Password");
});

router.get("/invalidUser", function (req, res) {
  res.render("login", { usertype: GLOBAL_USER });
});

// Faculty functionality
router.get("/faculty/:id", function (req, res) {
  if (req.isAuthenticated()) {
    // Faculty.findOne({_id:req.params.id},(err,found)=>{
    //   if(err){
    //     console.log("Error11");
    //     res.redirect("/faculty");
    //   }
    //   else{
    //     if(!found){
    //       console.log("Error22");
    //       res.redirect("/faculty");
    //     }
    //     else{
    //       res.render("faculty-control");
    //     }
    //   }
    // })
    res.render("faculty-control");
  } else {
    console.log("Error33");
    res.redirect("/faculty");
  }
});

router.post("/faculty/:id/getDetails", actions.postBackFacultyContent);

router.post("/faculty/:id/workschedule", actions.facultyWorkSceduleHandler);

router.post(
  "/faculty/:id/workschedule/delete",
  actions.facultyWorkScheduleDeleteHandler
);

router.post("/faculty/:id/postNewAssignment", actions.handleNewAssignment);

router.post("/faculty/:id/createCustomList", actions.handleNewListCreation);

router.post(
  "/faculty/:id/addItemToCustomList",
  actions.handleNewItemInsertionCustomList
);

router.post(
  "/faculty/:id/deleteCustomListItem",
  actions.customListDeleteHandler
);

router.post("/faculty/:id/addSubject", actions.addSubject);

router.post("/faculty/:id/deleteCustomList", actions.listDeletion);

router.get("/logout", actions.logout);

// Student functionality

router.get("/student/:id", function (req, res) {
  if (req.isAuthenticated()) {
    // Student.findOne({_id:req.params.id},(err,found)=>{
    //   if(err){
    //     console.log("Error11");
    //     res.redirect("/student");
    //   }
    //   else{
    //     if(!found){
    //       console.log("Error22");
    //       res.redirect("/student");
    //     }
    //     else{
    //       res.render("student-control");
    //     }
    //   }
    // })
    res.render("student-control");
  } else {
    console.log("Error33");
    res.redirect("/student");
  }
});

router.post("/student/:id/workschedule", actions.studentWorkSceduleHandler);

router.post(
  "/student/:id/workschedule/delete",
  actions.studentWorkScheduleDeleteHandler
);

router.post(
  "/student/:id/createCustomList",
  actions.studentHandleNewListCreation
);

router.post(
  "/student/:id/addItemToCustomList",
  actions.studentHandleNewItemInsertionCustomList
);

router.post(
  "/student/:id/deleteCustomListItem",
  actions.studentCustomListDeleteHandler
);

router.post("/student/:id/getDetails", actions.postBackStudentContent);

router.post("/student/:id/deleteAssignment", actions.deleteAssignment);

router.post(
  "/student/:id/deleteStudentCustomList",
  actions.deleteStudentCustomList
);

module.exports = router;
