// models/AbsencesModel.js
const mongoose = require("mongoose");

const Absence = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Référence vers le modèle User
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Absence", Absence);
