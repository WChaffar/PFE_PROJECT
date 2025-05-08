const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Declare the Schema of the Mongo model
var taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence vers le modèle User
      required: true,
    },
    taskName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Référence vers le modèle User
      required: true,
    },
    projectPhase:{
      type: String,
      enum: ["Design", "Design","Development","Testing"], 
      required: true,
    },
      RequiredyearsOfExper:{
        type:Number,
        required:true
      },
     startDate:{
        type:Date,
        required:true
     },
     endDate:{
        type:Date,
        required:true
     },
     requiredSkills:{
      type: [String],  // Declaring an array of strings
      required: true
    },
     langaugesSpoken:{
     type: [String],  // Declaring an array of strings
     required: true
    },
    requiredCertifications:{
      type: [String],  // Declaring an array of strings
      required: true
     },
  },
  {
    timestamps: true,
  }
);

// Middleware pour valider les dates avant l'enregistrement
taskSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("End date cannot be before start date"));
  }
  next();
});


//Export the model
module.exports = mongoose.model("Task", taskSchema);
