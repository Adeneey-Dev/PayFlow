const express = require("express");
const authRoutes = require("./authRoutes");
const walletRoutes = require("./walletRoutes");
const paymentRoutes = require("./paymentRoutes");

const routes = [authRoutes, walletRoutes, paymentRoutes];

module.exports = routes;

// const express = require("express");
// const authRoutes = require("./authRoutes");

// const router = express.Router();

// router.use("/", authRoutes);

// module.exports = router;
