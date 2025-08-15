# 💳 Paylow — Digital Wallet & Payment System

Paylow is a **secure digital wallet backend** built with **Node.js** and **Express**, allowing users to:
- Create an account
- Fund their wallet via **Flutterwave**
- Transfer money to other users
- Withdraw funds
- View transaction history
- Receive **email & SMS notifications** for transactions

---

## 📌 Features
- 🔐 **User Authentication** (JWT + bcrypt)
- 💰 **Wallet Funding** via Flutterwave API
- 🔄 **Peer-to-Peer Transfers**
- 📜 **Transaction History**
- 📧 **Email & SMS Notifications**
- 🛡 **Secure API** with validation & error handling

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Payments:** Flutterwave API
- **Authentication:** JWT & bcrypt
- **Notifications:** Nodemailer (Email), Twilio (SMS)
- **Environment:** dotenv

---

## Project Structure

PayLow/
│
├── src/
│   ├── config/
│   │   ├── db.js                      # MongoDB connection
│   │   ├── flutterwave.js              # Flutterwave configuration
│   │   └── mailer.js                   # Nodemailer configuration
│
│   ├── controllers/
│   │   ├── authController.js           # Register/Login logic
│   │   ├── walletController.js         # Wallet operations
│   │   ├── paymentController.js        # Payment funding & verification
│   │   └── transferController.js       # Peer-to-peer transfers
│
│   ├── middlewares/
│   │   ├── authorization.js            # Authorization logic
│   │   ├── isAdmin.js                   # Verify if it's Admin or User
│
│   ├── models/
│   │   ├── otpModel.js                  # OTP schema
│   │   ├── userModel.js                 # User schema
│   │   ├── walletModel.js               # Wallet schema
│   │   └── transactionModel.js          # Transaction schema
│
│   ├── routes/
│   │   ├── authRoutes.js                # Auth endpoints
│   │   ├── walletRoutes.js              # Wallet endpoints
│   │   └── paymentRoutes.js             # Payment endpoints
│
│   ├── utils/
│   │   ├── jwt.js                       # JWT generation & verification
│   │   ├── sendMail.js                  # Email sending function
│   │   ├── sendSMS.js                   # SMS sending function
│   │   ├── sendOtp.js                   # Email OTP for authorization
│   │   └── validators.js                # Input validation
│
│   ├── app.js                           # Express app entry
│   └── server.js                        # Server startup
│
├── .env                                 # Environment variables (ignored by Git)
├── .gitignore                           # Ignored files
├── package.json                         # Project dependencies
└── README.md                            # Project documentation

**Author:** Adeneey_Dev
**Email:** Oyewolesaheed638@gmail.com
