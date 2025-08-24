const express = require("express");
const {
  createAssignment,
  updateAssignmentDates,
  deleteAssignment,
  getEmployeeAssignments,
  getAllEmployeesAssignments,
  getAssignmentsForEmployee,
  updateAssignmentTimeEntry,
  updateAssignmentTimeEntries,
  updateAssignement,
} = require("../controller/assignementCtrl");
const {getRecommandations} = require("../controller/autoAssignementCtrl");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createAssignment);
router.get(
  "/getEmployeeAssignement/:employeeId",
  authMiddleware,
  getEmployeeAssignments
);
//router.get("/getOne/:id",authMiddleware,getOneProject);
router.delete("/deleteOne/:assignmentId", authMiddleware, deleteAssignment);
router.put("/editOne/:id", authMiddleware, updateAssignmentDates);
router.get(
  "/getEmployeeAssignements/all",
  authMiddleware,
  getAllEmployeesAssignments
);
router.get(
  "/getAssignementsForEmployee/all",
  authMiddleware,
  getAssignmentsForEmployee
);
router.put(
  "/updateAssignementTimeEntry/:assignmentId",
  authMiddleware,
  updateAssignmentTimeEntry
);
router.put(
  "/updateAssignementTimeEntries/:assignmentId",
  authMiddleware,
  updateAssignmentTimeEntries
);

router.put("/update/:id", authMiddleware, updateAssignement);


router.get('/getRecommendation/:userId',authMiddleware, getRecommandations);


module.exports = router;
