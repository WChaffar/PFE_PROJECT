const BusinessUnit = require("../models/BusinessUnitModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required
const User = require("../models/userModel");

// Middleware de validation de l'email
const validateBU = [];

// Create a Task ----------------------------------------------

const createBU = [
  validateBU,
  asyncHandler(async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    //
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg); // Lancer la première erreur trouvée
    }
    const { name, code, description, isActive } = req.body;
    /**
     * TODO:With the help of task name find the task exists or not
     */
    const newBU = await BusinessUnit.create({
      name,
      code,
      description,
      isActive,
    });
    res.json(newBU);
  }),
];

// get all Business Unit ----------------------------------------------

const getAllBu = asyncHandler(async (req, res) => {
  try {
    const findBu = await BusinessUnit.find();

    if (findBu.length === 0) {
      throw new Error("No business unit found.");
    }

    res.status(200).json(findBu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const updateBusinessUnit = asyncHandler(async (req, res) => { 
  try {
    const { id } = req.params;

    // Validation de l'ID MongoDB
    validateMongoDbId(id);

    // Chercher et mettre à jour la BU
    const findBu = await BusinessUnit.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );

    if (!findBu) {
      throw new Error(
        "Business unit not found or you do not have permission to edit it."
      );
    }

    // Vérifier si le champ 'Activated' est présent dans le body et s'il est false
    if (req.body.hasOwnProperty('isActive') && req.body.isActive === false) {
      // Désactiver tous les utilisateurs liés à cette BU
      await User.updateMany(
        { businessUnit: id },
        { $set: { Activated: false } }
      );
    }

    res.status(200).json({
      message: "Business unit updated successfully.",
      data: findBu,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get One Business unit by ID ----------------------------------------------

const getBusinessUnitById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const findBU = await BusinessUnit.findOne({ _id: id });

    if (!findBU) {
      throw new Error("Project not found.");
    }
    res.status(200).json(findBU);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const deleteBuByID = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification de l'ID MongoDB
    validateMongoDbId(id);

    // Vérifier si la BU existe
    const bu = await BusinessUnit.findById(id);
    if (!bu) {
      throw new Error("Business unit not found or you do not have permission to delete it.");
    }

    // Désactiver tous les utilisateurs liés à cette BU
    await User.updateMany(
      { businessUnit: id },
      { $set: { Activated: false } }
    );

    // Supprimer la BU
    await BusinessUnit.findByIdAndDelete(id);

    res.status(200).json({
      message: "Business unit deleted successfully. All related users have been deactivated.",
      _id: id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  createBU,
  getAllBu,
  updateBusinessUnit,
  getBusinessUnitById,
  deleteBuByID
};
