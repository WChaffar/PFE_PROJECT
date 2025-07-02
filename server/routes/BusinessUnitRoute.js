const express = require("express");
const {
createBU,
getAllBu,
updateBusinessUnit,
getBusinessUnitById,
deleteBuByID
} = require("../controller/BusinessUnitCtrl");
const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.post("/create",authMiddleware,createBU);
router.get("/getAllBu",authMiddleware,getAllBu);
router.put("/updateBusinessUnit/:id",authMiddleware,updateBusinessUnit);
router.get("/getBuById/:id",authMiddleware,getBusinessUnitById);
router.delete("/deleteBuById/:id",authMiddleware,deleteBuByID);



module.exports = router;
