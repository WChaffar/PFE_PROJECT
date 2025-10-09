const express = require("express");
const {
  generateProjectReport,
  generateBulkReport,
} = require("../controller/reportCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Generate individual project report
router.get("/project/:id", authMiddleware, generateProjectReport);

// Generate bulk projects report
router.get("/bulk", authMiddleware, generateBulkReport);

module.exports = router;