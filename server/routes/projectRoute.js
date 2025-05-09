const express = require("express");
const {
    createProject,
    getAllProjects,
    getOneProject,
    deleteOneProject,
    editOneProject
} = require("../controller/projectCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createProject);
router.get("/getAll",authMiddleware,getAllProjects);
router.get("/getOne/:id",authMiddleware,getOneProject);
router.delete("/deleteOne/:id",authMiddleware,deleteOneProject);
router.put("/editOne/:id",authMiddleware,editOneProject);


module.exports = router;
