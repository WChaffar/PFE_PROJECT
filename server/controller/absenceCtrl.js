const Absence = require("../models/AbsenceModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required
const Notification = require("../models/NotificationsModel");

// Middleware de validation
const validateAbsence = [
  check("type", "Type is required").not().isEmpty(),
  check("startDate", "Start date is required").isISO8601(),
  check("endDate", "End date is required").isISO8601(),
  check("endDate", "End date must be after start date").custom(
    (value, { req }) => {
      return new Date(value) >= new Date(req.body.startDate);
    }
  ),
];

// Create a Absence ----------------------------------------------

const createAbsence = [
  validateAbsence,
  asyncHandler(async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    //
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg); // Lancer la première erreur trouvée
    }
    const { type, startDate, endDate } = req.body;

    // Check for overlapping absence
    const overlappingAbsence = await Absence.findOne({
      employee: req.user._id,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (overlappingAbsence) {
      return res.status(400).json({
        message: "This absence overlaps with an existing absence.",
      });
    }
    /**
     * TODO:With the help of task name find the task exists or not
     */
    const newAbsence = await Absence.create({
      employee: req?.user?._id,
      type,
      startDate,
      endDate,
    });
    const newNotif = await Notification.create({
      type: "Employee Absence",
      message:
        req?.user?.fullName +
        " will be absent from " +
        startDate +
        " to " +
        endDate +
        ".",
      dateTime: new Date(), // current date and time
      responsibleId: req?.user?.manager,
    });
    res.json(newAbsence);
  }),
];

// get all my absences ----------------------------------------------

const getAllMyAbsences = asyncHandler(async (req, res) => {
  try {
    const findAbs = await Absence.find({ employee: req.user._id });

    if (findAbs.length === 0) {
      throw new Error("No absence found.");
    }
    res.status(200).json(findAbs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get all my absences ----------------------------------------------

const getMyAbsenceById = asyncHandler(async (req, res) => {
  try {
    const { absentId } = req.params;
    const findAbs = await Absence.findOne({
      _id: absentId,
      employee: req.user._id,
    });

    if (findAbs.length === 0) {
      throw new Error("No absence found.");
    }
    res.status(200).json(findAbs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper function to format a date as yyyy-MM-dd
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const editAbsenceById = asyncHandler(async (req, res) => {
  try {
    const { absentId } = req.params; // On récupère l'ID du projet dans les paramètres de la requête

    // Validation de l'ID MongoDB
    validateMongoDbId(absentId);

    // Chercher et mettre à jour le projet si l'utilisateur est le propriétaire
    const absence = await Absence.findOneAndUpdate(
      { _id: absentId }, // On s'assure que l'utilisateur est bien le propriétaire du projet
      { ...req.body } // Données à mettre à jour
    );

    // Si le projet n'est pas trouvé
    if (!absence) {
      throw new Error(
        "Absence not found or you do not have permission to edit it."
      );
    }
    const startFormatted = formatDate(absence.startDate);
    const endFormatted = formatDate(absence.endDate);

    const newNotif = await Notification.create({
      type: "Employee Absence Update",
      message: `${req?.user?.fullName} has updated their absence. New dates: from ${startFormatted} to ${endFormatted}.`,
      dateTime: new Date(),
      responsibleId: req?.user?.manager, // manager who should receive the notification
    });
    // Réponse réussie avec le projet mis à jour
    res.status(200).json({
      message: "Absence updated successfully.",
      data: absence,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const deleteAbsenceByID = asyncHandler(async (req, res) => {
  try {
    const { absentId } = req.params; // Get the task ID from request parameters

    // Validate MongoDB ID
    validateMongoDbId(absentId);

    // Attempt to find and delete the task that belongs to the logged-in user
    const absence = await Absence.findOneAndDelete({ _id: absentId });

    // If no task is found, throw an error
    if (!absence) {
      throw new Error(
        "Absence not found or you do not have permission to delete it."
      );
    }

    const startFormatted = formatDate(absence.startDate);
    const endFormatted = formatDate(absence.endDate);

    const newNotif = await Notification.create({
      type: "Employee Absence Cancellation",
      message: `${req?.user?.fullName} has canceled their absence from ${startFormatted} to ${endFormatted}.`,
      dateTime: new Date(),
      responsibleId: req?.user?.manager,
    });

    // Send success response
    res.status(200).json({
      message: "Absence deleted successfully.",
      _id: absentId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get all my absences ----------------------------------------------

const getAllEmployeeAbsences = asyncHandler(async (req, res) => {
  try {
    const { employeeId } = req.params; // Get the task ID from request parameters

    const findAbs = await Absence.find({ employee: employeeId });
    if (findAbs.length === 0) {
      throw new Error("No absence found.");
    }
    res.status(200).json(findAbs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// get all my absences ----------------------------------------------

const getAllEmployeesAbsencesForManager = asyncHandler(async (req, res) => {
  try {
    const findAbs = await Absence.find().populate({
      path: "employee",
      select: "manager", // Only include the 'manager' field from employee
    });
    const filtredAbsences = findAbs.filter(
      (a) => a.employee.manager !== req.user._id
    );

    if (findAbs.length === 0) {
      throw new Error("No absences found.");
    }
    res.status(200).json(filtredAbsences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  createAbsence,
  getAllMyAbsences,
  getMyAbsenceById,
  editAbsenceById,
  deleteAbsenceByID,
  getAllEmployeeAbsences,
  getAllEmployeesAbsencesForManager,
};
