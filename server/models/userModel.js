const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Experience object
var experienceSchema = new mongoose.Schema({
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
    type: Date, // Optional, can be null if the person is still at the job
  },
  responsibilities: {
    type: String,
    required: true,
  },
});

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence vers le modèle User
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    profilePicture: {
      type: String,
      default:""
    },
    jobTitle: {
      type: String,
    },
    employmentType: {
      type: String,
    },
    dateOfJoining: {
      type: Date,
    },
    seniorityLevel: {
      type: String,
    },
    remoteWorkAllowed: {
      type: Boolean,
      default: false,
    },
    keySkills: {
      type: [String], // Declaring an array of strings
    },
    certifications: {
      type: [String], // Declaring an array of strings
    },
    yearsOfExperience: {
      type: Number, // Declaring an array of strings
    },
    Activated: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    BusinessUnit:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit", // Référence vers le modèle User
    },
    // Adding the array of experiences
    experience: [experienceSchema], // An array of Experience objects
    assignments: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
