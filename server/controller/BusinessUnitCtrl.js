const BusinessUnit = require("../models/BusinessUnitModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult,check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required

// Middleware de validation de l'email
const validateBU = [
  ];
  
  // Create a Task ---------------------------------------------- 
  
  const createBU =[
    validateBU, asyncHandler(async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    //
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg); // Lancer la première erreur trouvée
    }
    const { name, code, description, isActive} = req.body;
    /**
     * TODO:With the help of task name find the task exists or not
     */
      const newBU = await BusinessUnit.create({
        name,code,description,isActive
      });
      res.json(newBU);

  })];


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



module.exports = {createBU,getAllBu};