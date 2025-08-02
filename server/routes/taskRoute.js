const express = require("express");
const {
    createTask,
    getAllTasks,
    getOneTask,
    deleteOneTask,
    editOneTask,
    getTasksByPorjectID,
    getTasksByManagerID,
} = require("../controller/taskCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createTask);
router.get("/getAll",authMiddleware,getAllTasks);
router.get("/getOne/:id",authMiddleware,getOneTask);
router.delete("/deleteOne/:id",authMiddleware,deleteOneTask);
router.put("/editOne/:id",authMiddleware,editOneTask);
router.get("/getTaskByProjectID/:projectId",authMiddleware,getTasksByPorjectID);
router.get("/getTaskByManagerID",authMiddleware,getTasksByManagerID);


module.exports = router;
