const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    phoneNumber: { type: Number, require: true },
    password: { type: String, require: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timeseries: true,
  }
);

const User = new mongoose.model("User", userSchema);

module.exports = User;
