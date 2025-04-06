const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
  return jwt.sign({ id },"PFE12345", { expiresIn: "3d" });
};

module.exports = { generateRefreshToken };
