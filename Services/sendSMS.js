const axios = require("axios");

const sendSMS = async (phoneNumber, otp) => {
  try {
    const payload = {
      to: phoneNumber,
      from: process.env.TERMII_SENDER_ID,
      sms: `Your PayFlow OTP is ${otp}`,
      type: "plain",
      channel: "generic",
      api_key: process.env.TERMII_API_KEY,
    };

    const response = await axios.post(
      "https://api.ng.termii.com/api/sms/send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ OTP SMS sent:", response.data);
  } catch (error) {
    console.error(
      "❌ Failed to send SMS:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

module.exports = sendSMS;
