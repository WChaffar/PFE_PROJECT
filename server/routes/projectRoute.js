const express = require("express");
const {
  createProject,
  getAllProjects,
  getOneProject,
  deleteOneProject,
  editOneProject,
  getAllBuProjects,
  changeProjectManager,
  getAllManagerProjects,
} = require("../controller/projectCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createProject);
router.get("/getAll", authMiddleware, getAllProjects);
router.get("/getOne/:id", authMiddleware, getOneProject);
router.delete("/deleteOne/:id", authMiddleware, deleteOneProject);
router.put("/editOne/:id", authMiddleware, editOneProject);
router.get(
  "/getBuAllProjects/:businessUnitId",
  authMiddleware,
  getAllBuProjects
);

router.put("/changeProjectManager/:oldManagerId/:newManagerId", authMiddleware, changeProjectManager);

router.get("/getAllMangerProjects/:managerId", authMiddleware, getAllManagerProjects);

module.exports = router;
