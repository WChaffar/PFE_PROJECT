const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Experience object
var experienceSchema = new mongoose.Schema(
    {
      CompanyName: {
        type: String,
        required: true,
      },
      JobTitle: {
        type: String,
        required: true,
      },
      StartDate: {
        type: Date,
        required: true,
      },
      EndDate: {
        type: Date,  // Optional, can be null if the person is still at the job
      },
      Responsibilities: {
        type: String,
        required: true,
      },
    },
  );


// Declare the Schema of the Mongo model
var teamSchema = new mongoose.Schema(
  {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence vers le modèle User
      required: true,
    },
    FullName: {
      type: String,
      required: true,
    },
    Email: {
        type:String,
        required:true
    },
    PhoneNumber: {
        type:String,
        required:true
    },
    ProfilePicture:{
        type:String,
    },
    JobTitle:{
        type:String,
        required:true
    },
    EmployementType:{
        type:String,
        required:true
    },
    DateOfJoining:{
        type: Date,
        required:true
    },
    SeniorityLevel:{
        type:String,
        required:true
    },
    RemoteWorkAllowed:{
        type:Boolean,
        default:false
    },
    keySkills:{
        type: [String],  // Declaring an array of strings
        required: true
    },
    Certifications: {
        type: [String],  // Declaring an array of strings
        required: true
    },
    YearsOfExperience: {
        type: Number,  // Declaring an array of strings
        required: true
    },
    // Adding the array of experiences
    Experience: [experienceSchema],  // An array of Experience objects
    assignments:{
      type:[mongoose.Schema.Types.ObjectId],
      default:[]
    }
  },
  {
    timestamps: true,
  }
);


//Export the model
module.exports = mongoose.model("Team", teamSchema);
