const express = require("express");
const {
  handleTransferMoney,
  handleGetWalletBalance,
  handleGetTransactionHistory,
  handleAddMoney,
  handleDeleteUser,
} = require("../Controllers/walletController");
const authorization = require("../Middlewares/authorization");
const isAdmin = require("../Middlewares/isAdmin");
const router = express.Router();

router.post("/add-money", authorization, handleAddMoney);

router.post("/transfer-money", authorization, handleTransferMoney);

router.get("/get-wallet-balance", authorization, handleGetWalletBalance);

router.get(
  "/get-transaction-history",
  authorization,
  handleGetTransactionHistory
);

router.post("/delete-user-account", authorization, isAdmin, handleDeleteUser);

module.exports = router;
