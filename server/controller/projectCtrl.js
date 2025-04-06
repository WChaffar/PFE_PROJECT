const Project = require("../models/projectModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult,check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required

// Middleware de validation de l'email
const validateProject = [
  ];

  
  // Create a Project ---------------------------------------------- 
  
  const createProject =[
    validateProject, asyncHandler(async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg); // Lancer la première erreur trouvée
    }
    /**
     * TODO:With the help of project name find the project exists or not
     */
    console.log(req.user?._id)
    const findProject = await Project.findOne({ projectName: req.body?.projectName , owner:req.user?._id });
  
    if (!findProject) {
      /**
       * TODO:if user not found user create a new user
       */
      const newProject = await Project.create({...req.body, owner:req.user?._id});
      res.json(newProject);
    } else {
      /**
       * TODO:if user found then thow an error: User already exists
       */
      throw new Error("Project Already Exists");
    }
  })];

  // get all Projects ---------------------------------------------- 
  
  const getAllProjects = asyncHandler(async (req, res) => {
    try {
  
      const findProjects = await Project.find({ owner: req.user?._id });
  
      if (findProjects.length === 0) {
        throw new Error("No projects found.");
      }
  
      res.status(200).json(findProjects);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

  // get One Project by ID ---------------------------------------------- 
  
  const getOneProject = asyncHandler(async (req, res) => {
    try {

      const { id } = req.params;
      console.log(id);
      validateMongoDbId(id);
      const findProject = await Project.findOne({ owner: req.user?._id, _id:id});
  
      if (!findProject) {
        throw new Error("Project not found.");
      }
  
      res.status(200).json(findProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });



  const deleteOneProject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;  // Get the project ID from request parameters

    // Validate MongoDB ID
    validateMongoDbId(id);

    // Attempt to find and delete the project that belongs to the logged-in user
    const project = await Project.findOneAndDelete({ owner: req.user?._id, _id: id });

    // If no project is found, throw an error
    if (!project) {
      throw new Error("Project not found or you do not have permission to delete it.");
    }

    // Send success response
    res.status(200).json({
      message: "Project deleted successfully."
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const editOneProject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;  // On récupère l'ID du projet dans les paramètres de la requête

    // Validation de l'ID MongoDB
    validateMongoDbId(id);

    // Chercher et mettre à jour le projet si l'utilisateur est le propriétaire
    const project = await Project.findOneAndUpdate(
      { owner: req.user?._id, _id: id }, // On s'assure que l'utilisateur est bien le propriétaire du projet
      { ...req.body }, // Données à mettre à jour
      { new: true } // Retourner le projet mis à jour
    );

    // Si le projet n'est pas trouvé
    if (!project) {
      throw new Error("Project not found or you do not have permission to edit it.");
    }

    // Réponse réussie avec le projet mis à jour
    res.status(200).json({
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

  


  module.exports = {createProject,getAllProjects, getOneProject,deleteOneProject,editOneProject};