const express = require("express");
const {
  createUser,
  loginUserCtrl,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,

} = require("../controller/userCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);

router.put("/reset-password/:token", resetPassword);

router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserCtrl);

router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
 
module.exports = router;
