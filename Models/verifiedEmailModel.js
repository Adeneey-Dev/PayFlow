const mongoose = require("mongoose");

const verifiedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },

  verifiedAt: { type: Date, default: Date.now },
});

const VerifiedEmail = mongoose.model("VerifiedEmail", verifiedEmailSchema);

module.exports = VerifiedEmail;
