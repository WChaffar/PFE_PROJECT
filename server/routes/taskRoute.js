const express = require("express");
const {
    createTask,
    getAllTasks,
    getOneTask,
    deleteOneTask,
    editOneTask
} = require("../controller/taskCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createTask);
router.get("/getAll",authMiddleware,getAllTasks);
router.get("/getOne/:id",authMiddleware,getOneTask);
router.get("/deleteOne/:id",authMiddleware,deleteOneTask);
router.put("/editOne/:id",authMiddleware,editOneTask);


module.exports = router;
