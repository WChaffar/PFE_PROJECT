const express = require("express");
const {
  detectOverchargeRisks,
  getRisksForManager,
} = require("../controller/riskCtrl");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/detectChargeRisks", authMiddleware, detectOverchargeRisks);
router.get("/getAll", authMiddleware, getRisksForManager);


module.exports = router;