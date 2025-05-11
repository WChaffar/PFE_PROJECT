const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Experience object
var experienceSchema = new mongoose.Schema(
    {
      companyName: {
        type: String,
        required: true,
      },
      jobTitle: {
        type: String,
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,  // Optional, can be null if the person is still at the job
      },
      responsibilities: {
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
    fullName: {
      type: String,
      required: true,
    },
    email: {
        type:String,
        required:true
    },
    phoneNumber: {
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
    },
    jobTitle:{
        type:String,
        required:true
    },
    employmentType:{
        type:String,
        required:true
    },
    dateOfJoining:{
        type: Date,
        required:true
    },
    seniorityLevel:{
        type:String,
        required:true
    },
    remoteWorkAllowed:{
        type:Boolean,
        default:false
    },
    keySkills:{
        type: [String],  // Declaring an array of strings
        required: true
    },
    certifications: {
        type: [String],  // Declaring an array of strings
        required: true
    },
    yearsOfExperience: {
        type: Number,  // Declaring an array of strings
        required: true
    },
    // Adding the array of experiences
    experience: [experienceSchema],  // An array of Experience objects
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
