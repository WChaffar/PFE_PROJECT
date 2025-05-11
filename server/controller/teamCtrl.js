const Team = require("../models/teamModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult,check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required

// Middleware de validation de l'email
const validateTeamMember = [
  ];

  
  // Create a Team Member ---------------------------------------------- 
  
const createTeamMember = [
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }
    const findTeamMember = await Team.findOne({ fullName: req.body?.fullName });

    if (!findTeamMember) {
      let newMember = req.body;
      newMember.manager = req.user?._id;

      if (req.file) {
        newMember.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      }

      const newTeam = await Team.create(newMember);
      res.json(newTeam);
    } else {
      throw new Error(
        "Team member already exists. Please add another character or number to the full name to resolve the conflict."
      );
    }
  }),
];


  // get all Team ---------------------------------------------- 
  
  const getAllTeamMember = asyncHandler(async (req, res) => {
    try {
  
      const findTeam = await Team.find({ manager: req.user?._id });
  
      if (findTeam.length === 0) {
        throw new Error("No team memebers found.");
      }
  
      res.status(200).json(findTeam);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

  // get One Project by ID ---------------------------------------------- 
  
  const getOneTeamMember = asyncHandler(async (req, res) => {
    try {

      const { id } = req.params;
      validateMongoDbId(id);
      const findOneTeam = await Team.findOne({ manager: req.user?._id, _id:id});
  
      if (!findOneTeam) {
        throw new Error("Team member not found.");
      }
  
      res.status(200).json(findOneTeam);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });



  const deleteOneTeamMemeber = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;  // Get the project ID from request parameters

    // Validate MongoDB ID
    validateMongoDbId(id);

    // Attempt to find and delete the project that belongs to the logged-in user
    const teamMemeber = await Team.findOneAndDelete({ manager: req.user?._id, _id: id });

    // If no project is found, throw an error
    if (!teamMemeber) {
      throw new Error("Team member not found or you do not have permission to delete it.");
    }

    // Send success response
    res.status(200).json({
      message: "Team memeber deleted successfully."
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const editOneTeamMember = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;  // On récupère l'ID du projet dans les paramètres de la requête

    // Validation de l'ID MongoDB
    validateMongoDbId(id);

    // Chercher et mettre à jour le projet si l'utilisateur est le propriétaire
    const teamMember = await Team.findOneAndUpdate(
      { manager: req.user?._id, _id: id }, // On s'assure que l'utilisateur est bien le propriétaire du projet
      { ...req.body }, // Données à mettre à jour
      { new: true } // Retourner le projet mis à jour
    );

    // Si le projet n'est pas trouvé
    if (!teamMember) {
      throw new Error("Team member not found or you do not have permission to edit it.");
    }

    // Réponse réussie avec le projet mis à jour
    res.status(200).json({
      message: "Team member updated successfully.",
      teamMember,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


  module.exports = {createTeamMember,getAllTeamMember, getOneTeamMember,deleteOneTeamMemeber,editOneTeamMember};