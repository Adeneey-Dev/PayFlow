const Flutterwave = require("flutterwave-node-v3");
const axios = require("axios");
require("dotenv").config();
const Wallet = require("../Models/walletModel");

const initiateWalletFunding = async (req, res) => {
  try {
    /*
    const { amount, email, phoneNumber, serviceTitle, redirectURL, token } =
      req.body;
    */
    const { amount } = req.body;
    const user = req.user;

    // const tx_ref = await generateReference("pb-trx");
    const tx_ref = `TX-${Date.now()}`;

    const paymentResponse = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref,
        amount,
        currency: "NGN",
        redirect_url: "https://payflow.com/payment-success",
        ///redirect_url: redirectURL,
        payment_options: "card",
        customer: {
          email: user.email,
          name: user.userName,
          //name: "Customer Name",
        },
        meta: {
          userId: user._id,
        },
        customizations: {
          title: "Prepone Technologies Ltd",
          description: `Pay ${amount} to my wallet`,
          logo: "https://www.preponebills.com/static/media/prepone-logo.ea786269390875a5a333.png",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const payment = paymentResponse.data;

    res.status(200).json({
      status: "Successful",
      payment,
      tx_ref,
    });
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        message: error.response.data.message || "An error occurred",
        status: error.response.data.status,
        data: error.response.data.data,
      });
    } else {
      // console.log(error);
      res.status(500).json({
        message: "An internal server error occurred",
        error: error.message,
      });
    }
  }
};

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;

    if (
      payload.event === "charge.completed" &&
      payload.data.status === "successful"
    ) {
      const userId = payload?.data?.meta?.userId;
      const amount = parseFloat(payload.data.amount);
      const txRef = payload?.data?.tx_ref;

      if (!userId || !txRef) {
        console.log("❌ Missing values:", { userId, txRef });
        return res.status(400).send("Missing required data");
      }
      // Find wallet and update balance
      // Prevent duplicates using tx_ref
      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) return res.status(404).send("Wallet not found");

      // TODO: Check if txRef has already been processed to avoid duplicates

      // 3. Update the wallet balance
      wallet.balance += amount;
      await wallet.save();

      console.log("Wallet funded successfully");

      return res.status(200).send("✅ Wallet funded successfully");

      //res.status(200).send("OK")
    }

    res.status(200).send("Ignored: Not a successful charge");
  } catch (error) {
    console.error("Error in Webhook:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
/*
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const initiateWalletFunding = async (req, res) => {
  const { amount } = req.body;
  const user = req.user; // From protect middleware

  try {
    const paymentPayload = {
      tx_ref: `TX-${Date.now()}`,
      amount,
      currency: "NGN",
      redirect_url: "https://payflow.com/payment-success", // Can be dummy for now
      customer: {
        email: user.email,
        name: user.userName,
      },
      meta: {
        userId: user._id, // Used later to credit wallet
      },
      customizations: {
        title: "Fund PayFlow Wallet",
        description: `Add ₦${amount} to wallet`,
        logo: "https://yourdomain.com/logo.png", // optional
      },
    };

    //const response = await flw.Transaction.initialize(paymentPayload);

    const response = await flw.PaymentInitiation.create(paymentPayload);

    res.status(200).json({
      status: "success",
      paymentLink: response.data.link,
      tx_ref: paymentPayload.tx_ref,
    });
  } catch (error) {
    console.error(
      "Flutterwave Init Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

const handleWebhook = async (req, res) => {
  const payload = req.body;

  // 1. Verify it’s successful
  if (
    payload.event === "charge.completed" &&
    payload.data.status === "successful"
  ) {
    const userId = payload.data.meta?.userId;
    const amount = parseFloat(payload.data.amount);

    if (!userId) return res.status(400).send("No userId in metadata");

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).send("Wallet not found");

    // Avoid duplicates: Check if already credited (you can add tx_ref tracking in DB)

    // 2. Update wallet
    wallet.balance += amount;
    await wallet.save();

    return res.status(200).send("Wallet funded");
  }

  return res.status(200).send("No action taken");
};
*/

module.exports = {
  initiateWalletFunding,
  handleWebhook,
};
