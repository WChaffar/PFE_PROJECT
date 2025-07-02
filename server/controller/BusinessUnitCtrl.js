const BusinessUnit = require("../models/BusinessUnitModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required

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
    const { id } = req.params; // On récupère l'ID du projet dans les paramètres de la requête

    // Validation de l'ID MongoDB
    validateMongoDbId(id);

    // Chercher et mettre à jour le projet si l'utilisateur est le propriétaire
    const findBu = await BusinessUnit.findOneAndUpdate(
      { _id: id }, // On s'assure que l'utilisateur est bien le propriétaire du projet
      { ...req.body }, // Données à mettre à jour
      { new: true } // Retourner le projet mis à jour
    );

    // Si le projet n'est pas trouvé
    if (!findBu) {
      throw new Error(
        "Business unit not found or you do not have permission to edit it."
      );
    }

    // Réponse réussie avec le projet mis à jour
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
    const { id } = req.params;  // Get the task ID from request parameters

    // Validate MongoDB ID
    validateMongoDbId(id);

    // Attempt to find and delete the task that belongs to the logged-in user
    const bu = await BusinessUnit.findOneAndDelete({ _id: id  });

    // If no task is found, throw an error
    if (!bu) {
      throw new Error("Business unit not found or you do not have permission to delete it.");
    }

    // Send success response
    res.status(200).json({
      message: "Business unit deleted successfully.",
      _id:id
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
