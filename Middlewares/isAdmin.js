const User = require("../Models/UserModel");

const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user);
  if (user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied: Admins only" });
  }
  next();
};

module.exports = isAdmin;
