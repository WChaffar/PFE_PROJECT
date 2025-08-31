const Notification = require("../models/NotificationsModel");
const asyncHandler = require("express-async-handler");

// Create a Project ----------------------------------------------

const createNotification = [
  asyncHandler(async (req, res) => {
    try {
      const newNotif = await Notification.create({
        ...req.body,
      });

      res.status(201).json({ success: true, data: newNotif });
    } catch (error) {
      // Gestion spécifique des erreurs Mongoose
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.errors,
        });
      }

      // Erreur générique
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }),
];


// get all Projects ----------------------------------------------

const getAllNotification = asyncHandler(async (req, res) => {
  try {
    const findNotifications = await Notification.find({ responsibleId: req.user?._id });

    if (findNotifications.length === 0) {
      throw new Error("No notifications found.");
    }

    res.status(200).json(findNotifications);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}); 

module.exports = {
  createNotification,
  getAllNotification,
};
