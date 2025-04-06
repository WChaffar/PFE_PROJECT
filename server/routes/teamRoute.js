const express = require("express");
const {
    createTeamMember,
    getAllTeamMember,
    getOneTeamMember,
    deleteOneTeamMemeber,
    editOneTeamMember
} = require("../controller/teamCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createTeamMember);
router.get("/getAll",authMiddleware,getAllTeamMember);
router.get("/getOne/:id",authMiddleware,getOneTeamMember);
router.get("/deleteOne/:id",authMiddleware,deleteOneTeamMemeber);
router.put("/editOne/:id",authMiddleware,editOneTeamMember);


module.exports = router;
