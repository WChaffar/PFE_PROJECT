const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Declare the Schema of the Mongo model
var projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence vers le modèle User
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    projectType: {
      type: String,
      enum: ["internal", "external"], // Define the project types here
      required: true,
    },
    projectCategory: {
      type: String,
      enum: ["Web Development", "Mobile App", "Software", "Database", "Design"], // define the allowed project types here
      required: true,
    },
    projectPriority: {
      type: String,
      enum: ["low", "medium", "high", "critical"], // Project priority enumeration
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    additionalFunding: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour valider les dates avant l'enregistrement
projectSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("End date cannot be before start date"));
  }
  if (this.deliveryDate < this.endDateDate) {
    return next(new Error("Delivery date cannot be before end date"));
  }
  next();
});

//Export the model
module.exports = mongoose.model("Project", projectSchema);
