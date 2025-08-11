const express = require("express");
const authorization = require("../Middlewares/authorization");
const {
  initiateWalletFunding,
  handleWebhook,
} = require("../Controllers/paymentController");

const router = express.Router();

router.post("/fund-wallet", authorization, initiateWalletFunding);

router.post("/webhooks/flutterwave", handleWebhook);

module.exports = router;
