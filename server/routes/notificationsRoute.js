const express = require("express");
const {
  createNotification,
  getAllNotification,
} = require("../controller/NotificationsCtrl");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createNotification);
router.get("/getAll", authMiddleware, getAllNotification);


module.exports = router;
