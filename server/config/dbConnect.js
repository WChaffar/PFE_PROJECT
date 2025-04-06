const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect("mongodb+srv://walidchaffar:PFE2025@pfecluster.vkdu7.mongodb.net/PFEDB?retryWrites=true&w=majority&appName=PFECluster");
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("DAtabase error");
  }
};
module.exports = dbConnect;
