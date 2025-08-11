const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateEmail = require("../Utils/validateEmail");
const User = require("../Models/UserModel");
const Wallet = require("../Models/walletModel");
const Otp = require("../Models/otpModel");
const sendOtp = require("../Services/sendOtp");
const sendEmail = require("../Services/sendMail");
const VerifiedEmail = require("../Models/verifiedEmailModel");
const sendSMS = require("../Services/sendSMS");

const handleRegister = async (req, res) => {
  const { userName, email, phoneNumber, password } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Please enter your email" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
      return res.status(400).json({ message: "Please enter your password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password should be a minimum of 6 characters",
      });
    }

    // Check if email was verified via OTP
    const emailVerified = await VerifiedEmail.findOne({ email });

    if (!emailVerified) {
      return res.status(403).json({
        message: "Email has not been verified. Please verify via OTP first.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await newUser.save();

    // Auto-create wallet
    const wallet = new Wallet({
      user: newUser.id,
      balance: 0,
    });

    await wallet.save();

    // await Wallet.create({ user: User?._id });

    // 6. Remove verified email record (cleanup)

    await VerifiedEmail.deleteOne({ email });

    res.status(201).json({
      mesage: "User account created successful",
      newUser: { userName, email, role: "user", wallet },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const handleSendOtp = async (req, res) => {
  console.log("send otp");
  const { email, phoneNumber } = req.body;

  //GENERATING 6-DIGIT OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  //EXPIRES IN 5 MINS FROM NOW
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    //DELETING AN EXISTING OTP FOR THIS EMAIL
    await Otp.deleteMany({ email });

    //SAVING THE NEW OTP GENERATED IN MY OtpModel DATABASE
    await Otp.create({ email, otp, expiresAt });

    //SENDING OTP TO USER VIA EMAIL
    await sendOtp(
      email,
      `Your OTP Code (it will expire in 5 minutes) ${otp}`,
      `<h2>Your OTP is: ${otp}</h2><p>Use this to complete your registration.</p>`
    );

    //SENDING OTP TO USER VIA SMS
    await sendSMS(phoneNumber, `Your PayFlow OTP is ${otp}`);

    res.status(200).json({
      message: "OTP sent to Email and number",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

const handleVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > record.expireAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Save verified email in DB so registration knows it's safe
    await VerifiedEmail.create({ email });

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User account does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1d",
    // });

    //GENERATING TOKEN, AN ACCESS TOKEN AND A REFRESH TOKEN
    const accessToken = jwt.sign(
      { id: user?._id, role: user?.role },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user?._id, role: user?.role },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    //SETTING THE REFRESH TOKEN AS COOKIE
    res.cookie("refreshtoken", refreshToken, {
      httpOnly: true,
      path: "/api/refreshToken",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    res.status(200).json({
      message: "Login successful.",
      accessToken,
      user: {
        email: user?.email,
        role: user?.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const handleGetAccessToken = async (req, res) => {
  //THIS FUNCTION HANDLE REGENERATING AN ACCESS TOKEN FROM THE REFRESH TOKEN STORE IN COOKIE WHEN THE ACCESS TOKEN EXPIRED

  try {
    const rf_token = req.cookies.refreshtoken;
    if (!rf_token)
      return res.status(401).json({ message: "Please login now!" });

    jwt.verify(rf_token, process.env.REFRESH_TOKEN, async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      //Looking up user in DB
      const user = await User.findById(decoded.id);
      if (!user)
        return res.status(404).json({ message: "User account does not exist" });

      const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_TOKEN,
        { expiresIn: "50m" }
      );

      return res.status(200).json({ accessToken });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Incoreect Email",
    });
  }

  const accessToken = await jwt.sign({ user }, `${process.env.ACCESS_TOKEN}`, {
    expiresIn: "5m",
  });

  await sendEmail(email, accessToken);

  res.status(200).json({ message: "Please check your email" });
};

const handleResetPassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User account not found" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  user.password = hashedPassword;

  await user.save();

  res.status(200).json({
    message: "Password reset successfully",
  });
};

module.exports = {
  handleRegister,
  handleSendOtp,
  handleVerifyOtp,
  handleLogin,
  handleGetAccessToken,
  handleForgotPassword,
  handleResetPassword,
};
