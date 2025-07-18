const express = require("express");
const {
createAbsence,
getAllMyAbsences,
getMyAbsenceById,
editAbsenceById,
deleteAbsenceByID,
getAllEmployeeAbsences,
getAllEmployeesAbsencesForManager
} = require("../controller/absenceCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createAbsence);
router.get("/getMyAbsences",authMiddleware,getAllMyAbsences);
router.get("/getMyAbsenceByID/:absentId",authMiddleware,getMyAbsenceById);
router.put("/updateAbsenceByID/:absentId",authMiddleware,editAbsenceById);
router.delete("/deleteAbsenceByID/:absentId",authMiddleware,deleteAbsenceByID);
router.get("/getEmployeeAbsenceByID/:employeeId",authMiddleware,getAllEmployeeAbsences);
router.get("/getEmployeesAbsenceForManager",authMiddleware,getAllEmployeesAbsencesForManager);

module.exports = router;
