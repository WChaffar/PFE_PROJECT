const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, "PFE12345", { expiresIn: "1d" });
};

module.exports = { generateToken };
