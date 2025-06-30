const express = require("express");
const {
createBU,
getAllBu
} = require("../controller/BusinessUnitCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createBU);
router.get("/getAllBu",authMiddleware,getAllBu);



module.exports = router;
