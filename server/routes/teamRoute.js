const express = require("express");
const {
    createTeamMember,
    getAllTeamMember,
    getOneTeamMember,
    deleteOneTeamMemeber,
    editOneTeamMember
} = require("../controller/teamCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/create",authMiddleware,upload.single("profilePicture"),createTeamMember);
router.get("/getAll",authMiddleware,getAllTeamMember);
router.get("/getOne/:id",authMiddleware,getOneTeamMember);
router.delete("/deleteOne/:id",authMiddleware,deleteOneTeamMemeber);
router.put("/editOne/:id",authMiddleware,upload.single("profilePicture"),editOneTeamMember);


module.exports = router;
