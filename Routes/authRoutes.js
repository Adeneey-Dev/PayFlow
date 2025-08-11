const express = require("express");

const {
  handleRegister,
  handleLogin,
  handleGetAccessToken,
  handleSendOtp,
  handleVerifyOtp,
  handleForgotPassword,
  handleResetPassword,
} = require("../Controllers/authController");

//const routes = require(".");
const router = express.Router();

router.post("/register", handleRegister);

router.post("/send-otp", handleSendOtp);

router.post("/verify-otp", handleVerifyOtp);

router.post("/login", handleLogin);

router.post("/refreshToken", handleGetAccessToken);

router.post("/forgot-password", handleForgotPassword);

router.patch("/reset-password", handleResetPassword);

module.exports = router;
