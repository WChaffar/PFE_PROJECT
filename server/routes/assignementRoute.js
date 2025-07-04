const express = require("express");
const {
    createAssignment,updateAssignmentDates,deleteAssignment,getEmployeeAssignments
} = require("../controller/assignementCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createAssignment);
router.get("/getEmployeeAssignement/:employeeId",authMiddleware,getEmployeeAssignments);
//router.get("/getOne/:id",authMiddleware,getOneProject);
router.get("/deleteOne/:id",authMiddleware,deleteAssignment);
router.put("/editOne/:id",authMiddleware,updateAssignmentDates);


module.exports = router;
