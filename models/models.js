const mongoose = require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  username: String,
  name:String,
  password: String,
  subject:String,
  profilePic:String,
  type:String,
  googleId:String
});

userSchema.plugin(passportLocalMongoose); 

const itemSchema = {
  name: String,
};
const Itemmodel = mongoose.model("Item", itemSchema);

const assignmentSchema={
  description:String,
  subject:String,
  deadline:Date,
  postedTime:Date,
  studentList:[String],
}

const AssignmentModel=mongoose.model("Assignment",assignmentSchema);

const customListSchema={
  listName:String,
  description:[itemSchema]
}

const CustomListModel=mongoose.model("CustomList",customListSchema);

const facultySchema = new mongoose.Schema({
  name:String,
  username: String,
  password: String,
  profilePic:String,
  subject:String,
  googleId:String,
  facultySchedule:[itemSchema],
  postedAssignment:[assignmentSchema],
  customLists:[customListSchema]
});

const studentSchema = new mongoose.Schema({
  name:String,
  username: String,
  password: String,
  googleId:String,
  profilePic:String,
  studentSchedule:[itemSchema],
  customLists:[customListSchema],
  givenAssignment:[assignmentSchema]
});



const Usermodel=new mongoose.model("User",userSchema)
const Facultymodel =new mongoose.model("Faculty", facultySchema);
const Studentmodel = new mongoose.model("Student", studentSchema);


module.exports={
    User:Usermodel,
    Faculty:Facultymodel,
    Student:Studentmodel,
    Item:Itemmodel,
    AssignmentModel:AssignmentModel,
    CustomListModel:CustomListModel
}