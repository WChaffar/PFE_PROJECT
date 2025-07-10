const express = require("express");
const {
  createTeamMember,
  getAllTeamMember,
  getOneTeamMember,
  deleteOneTeamMemeber,
  editOneTeamMember,
  getAllUsers,
  editTeamMemberBU,
  updateUserValidation,
  getUsersByRole,
  updateUserManager,
  getAllTeamForManager
} = require("../controller/teamCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  upload.single("profilePicture"),
  createTeamMember
);
router.get("/getAll", authMiddleware, getAllUsers);
router.get("/getAll/forManager", authMiddleware, getAllTeamForManager);
router.get("/getOne/:id", authMiddleware, getOneTeamMember);
router.delete("/deleteOne/:id", authMiddleware, deleteOneTeamMemeber);
router.put(
  "/editOne/:id",
  authMiddleware,
  upload.single("profilePicture"),
  editOneTeamMember
);
router.put("/editOne/BU/:id", authMiddleware, editTeamMemberBU);
router.put("/editOne/accountState/:id", authMiddleware, updateUserValidation);
router.get("/getUsersByRole/:role", authMiddleware, getUsersByRole);
router.put("/editOne/manager/:id", authMiddleware, updateUserManager);

module.exports = router;
