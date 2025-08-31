const Team = require("../models/teamModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const mongoose = require("mongoose"); // Erase if already required
const Notification = require("../models/NotificationsModel");

// Middleware de validation de l'email
const validateTeamMember = [];

// Create a Team Member ----------------------------------------------

const createTeamMember = [
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error(errors.array()[0].msg);
    }
    const findTeamMember = await User.findOne({ fullName: req.body?.fullName });

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

// Get all users whose role is not "RH"
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: "RH" } })
    .select("-password -refreshToken")
    .populate("businessUnit manager");

  if (users.length === 0) {
    res.status(404).json({ message: "No users found." });
    return;
  }

  res.status(200).json(users);
});

// Get all users whose role is not "RH"
const getAllTeamForManager = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: { $nin: ["RH", "BUDirector", "Manager"] },
    manager: req.user._id, // assuming req.user is populated via authentication middleware
  })
    .select("-password -refreshToken")
    .populate("businessUnit manager");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found." });
  }
  if (users.length === 0) {
    res.status(404).json({ message: "No users found." });
    return;
  }

  res.status(200).json(users);
});

// get One Project by ID ----------------------------------------------

const getOneTeamMember = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    const findOneTeam = await User.findOne({ manager: req.user?._id, _id: id });

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
    const { id } = req.params; // Get the project ID from request parameters
    // Validate MongoDB ID
    validateMongoDbId(id);

    // Attempt to find and delete the project that belongs to the logged-in user
    const teamMemeber = await User.findOneAndDelete({
      manager: req.user?._id,
      _id: id,
    });

    // If no project is found, throw an error
    if (!teamMemeber) {
      throw new Error(
        "Team member not found or you do not have permission to delete it."
      );
    }

    // Send success response
    res.status(200).json({
      message: "Team memeber deleted successfully.",
      _id: id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const editOneTeamMember = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    // Si une nouvelle photo est uploadée, on la rajoute au corps de la requête
    if (req.file) {
      req.body.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }

    const teamMember = await User.findOneAndUpdate(
      { manager: req.user?._id, _id: id },
      { ...req.body },
      { new: true }
    );

    if (!teamMember) {
      throw new Error(
        "Team member not found or you do not have permission to edit it."
      );
    }

    res.status(200).json({
      message: "Team member updated successfully.",
      data: teamMember,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const editTeamMemberBU = asyncHandler(async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    validateMongoDbId(id);
    const teamMember = await User.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    )
      .select("-password -refreshToken")
      .populate("businessUnit manager");
    if (!teamMember) {
      throw new Error(
        "Team member not found or you do not have permission to edit it."
      );
    }

    res.status(200).json({
      message: "The team member's business unit has been updated successfully.",
      data: teamMember,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const updateUserValidation = asyncHandler(async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    validateMongoDbId(id);
    const teamMember = await User.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    )
      .select("-password -refreshToken")
      .populate("businessUnit manager");
    if (!teamMember) {
      throw new Error(
        "Team member not found or you do not have permission to edit it."
      );
    }

    res.status(200).json({
      message:
        "The team member's validation state has been updated successfully.",
      data: teamMember,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users whose role is not "RH"
const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const users = await User.find({ role: role })
    .select("-password -refreshToken")
    .populate("businessUnit manager");

  if (users.length === 0) {
    res.status(404).json({ message: "No users found." });
    return;
  }

  res.status(200).json(users);
});

const updateUserManager = asyncHandler(async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    validateMongoDbId(id);
    const teamMember = await User.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    )
      .select("-password -refreshToken")
      .populate("businessUnit manager");
    if (!teamMember) {
      throw new Error(
        "Team member not found or you do not have permission to edit it."
      );
    }
    console.log("Hey");
    const newNotif = await Notification.create({
      type: "New Team Member",
      message: `${teamMember?.fullName} (ID: ${teamMember?._id}) has been assigned to your team.`,
      dateTime: new Date(), // current date and time
      responsibleId: teamMember?.manager, // the manager who should receive the notification
    });
    console.log(newNotif);

    res.status(200).json({
      message: "The team member's manager has been updated successfully.",
      data: teamMember,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const completeMyProfile = asyncHandler(async (req, res) => {
  try {
    console.log(req.file);

    // Si une nouvelle photo est uploadée, on la rajoute au corps de la requête
    if (req.file) {
      req.body.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }

    const teamMember = await User.findOneAndUpdate(
      { _id: req.user._id },
      { ...req.body, profileCompleted: true },
      { new: true }
    );
    console.log(teamMember);

    if (!teamMember) {
      throw new Error("You do not have permission to edit this informations.");
    }

    res.status(200).json({
      message: "Profile completed successfully.",
      data: teamMember,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users whose role is not "RH"
const getAllBuManagers = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: "Manager",
    businessUnit: req?.user?.businessUnit, // assuming req.user is populated via authentication middleware
  })
    .select("-password -refreshToken")
    .populate("businessUnit");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found." });
  }
  if (users.length === 0) {
    res.status(404).json({ message: "No users found." });
    return;
  }

  res.status(200).json(users);
});

// Get all users whose role is not "RH"
const getTeamForManagerInBu = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const users = await User.find({
    role: { $nin: ["RH", "BUDirector", "Manager"] },
    manager: managerId, // assuming req.user is populated via authentication middleware
  })
    .select("-password -refreshToken")
    .populate("businessUnit manager");

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found." });
  }
  if (users.length === 0) {
    res.status(404).json({ message: "No users found." });
    return;
  }

  res.status(200).json(users);
});

module.exports = {
  createTeamMember,
  getOneTeamMember,
  deleteOneTeamMemeber,
  editOneTeamMember,
  getAllUsers,
  editTeamMemberBU,
  updateUserValidation,
  getUsersByRole,
  updateUserManager,
  getAllTeamForManager,
  completeMyProfile,
  getAllBuManagers,
  getTeamForManagerInBu,
};
