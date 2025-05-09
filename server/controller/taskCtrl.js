const Task = require("../models/taskModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult,check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required

// Middleware de validation de l'email
const validateTask = [
  ];

  
  // Create a Task ---------------------------------------------- 
  
  const createTask =[
    validateTask, asyncHandler(async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg); // Lancer la première erreur trouvée
    }
    /**
     * TODO:With the help of task name find the task exists or not
     */
      const newTask = await Task.create({...req.body, owner:req.user?._id});
      res.json(newTask);

  })];

  // get all Tasks ---------------------------------------------- 
  
  const getAllTasks = asyncHandler(async (req, res) => {
    try {
  
      const findTasks = await Task.find({ owner: req.user?._id });
  
      if (findTasks.length === 0) {
        throw new Error("No tasks found.");
      }
  
      res.status(200).json(findTasks);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // get Tasks by project ID ---------------------------------------------- 
  
  const getTasksByPorjectID = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    try {
      const findTasks = await Task.find({ owner: req.user?._id, project:projectId });
  
      if (findTasks.length === 0) {
        throw new Error("No tasks found.");
      }
  
      res.status(200).json(findTasks);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });


  
  // get One Project by ID ---------------------------------------------- 
  
  const getOneTask = asyncHandler(async (req, res) => {
    try {

      const { id } = req.params;
      console.log(id);
      validateMongoDbId(id);
      const findTask = await Task.findOne({ owner: req.user?._id, _id:id}); 
      if (!findTask) {
        throw new Error("Task not found.");
      }
  
      res.status(200).json(findTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });



  const deleteOneTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;  // Get the task ID from request parameters

    // Validate MongoDB ID
    validateMongoDbId(id);

    // Attempt to find and delete the task that belongs to the logged-in user
    const task = await Task.findOneAndDelete({ owner: req.user?._id, _id: id  });

    // If no task is found, throw an error
    if (!task) {
      throw new Error("Task not found or you do not have permission to delete it.");
    }

    // Send success response
    res.status(200).json({
      message: "Task deleted successfully.",
      _id:id
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const editOneTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;  // On récupère l'ID du projet dans les paramètres de la requête

    // Validation de l'ID MongoDB
    validateMongoDbId(id);

    // Chercher et mettre à jour le projet si l'utilisateur est le propriétaire
    const task = await Task.findOneAndUpdate(
      { owner: req.user?._id, _id: id }, // On s'assure que l'utilisateur est bien le propriétaire du projet
      { ...req.body }, // Données à mettre à jour
      { new: true } // Retourner le projet mis à jour
    );

    // Si le projet n'est pas trouvé
    if (!task) {
      throw new Error("Task not found or you do not have permission to edit it.");
    }

    // Réponse réussie avec le projet mis à jour
    res.status(200).json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

  


  module.exports = {createTask,getAllTasks, getOneTask,deleteOneTask,editOneTask,getTasksByPorjectID};