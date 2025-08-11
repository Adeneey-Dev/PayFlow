const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const routes = require("./Routes");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 6000;

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("mongodb connected....");
  app.listen(PORT, () => {
    console.log(`Server started running on port ${PORT}`);
  });
});

app.use("/api", routes);

//app.use(routes);
app.get("/api/webhooks/flutterwave", (req, res) => {
  res.send("✅ Server is working");
});
