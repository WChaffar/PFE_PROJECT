const express = require("express");
const {
    createAssignment,updateAssignmentDates,deleteAssignment,getEmployeeAssignments,
    getAllEmployeesAssignments,
    getAssignmentsForEmployee,
    updateAssignmentTimeEntry,
    updateAssignmentTimeEntries
} = require("../controller/assignementCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createAssignment);
router.get("/getEmployeeAssignement/:employeeId",authMiddleware,getEmployeeAssignments);
//router.get("/getOne/:id",authMiddleware,getOneProject);
router.get("/deleteOne/:id",authMiddleware,deleteAssignment);
router.put("/editOne/:id",authMiddleware,updateAssignmentDates);
router.get("/getEmployeeAssignements/all",authMiddleware,getAllEmployeesAssignments);
router.get("/getAssignementsForEmployee/all",authMiddleware,getAssignmentsForEmployee);
router.put("/updateAssignementTimeEntry/:assignmentId",authMiddleware,updateAssignmentTimeEntry);
router.put("/updateAssignementTimeEntries/:assignmentId",authMiddleware,updateAssignmentTimeEntries);


module.exports = router;
