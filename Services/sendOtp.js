const nodemailer = require("nodemailer");

const sendOtp = async (to, subject, htmlContent) => {
  try {
    let mailTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.EMAIL_PASSWORD}`,
      },
    });

    const mailDetails = {
      from: `${process.env.EMAIL}`,
      to,
      subject,
      html: htmlContent,
    };

    await mailTransport.sendMail(mailDetails);
  } catch (error) {
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

module.exports = sendOtp;
