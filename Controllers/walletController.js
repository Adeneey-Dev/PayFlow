const Transaction = require("../Models/transactionModel");
const User = require("../Models/UserModel");
const Wallet = require("../Models/walletModel");

const handleAddMoney = async (req, res) => {
  const { amount } = req.body;
  try {
    const wallet = await Wallet.findOne({ user: req.user });

    if (!wallet) {
      return res.status(404).json({ msg: "Wallet not found" });
    }

    wallet.balance += amount;
    await wallet.save();

    res.status(200).json({
      msg: "Money added",
      balance: wallet.balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const handleTransferMoney = async (req, res) => {
  const { receiverEmail, amount } = req.body;
  const senderId = req.user; // Set by authMiddleware

  try {
    const senderWallet = await Wallet.findOne({ user: senderId });

    if (!senderWallet) {
      return res.status(404).json({ msg: "Sender wallet not found" });
    }
    if (senderWallet.balance < amount) {
      return res.status(400).json({ msg: "Insufficient balance" });
    }

    const receiver = await User.findOne({ email: receiverEmail });

    if (!receiver) {
      return res.status(404).json({ msg: "Receiver not found" });
    }
    const receiverWallet = await Wallet.findOne({ user: receiver?._id });

    if (!receiverWallet) {
      return res.status(404).json({ msg: "Receiver wallet not found" });
    }

    // Perform transfer
    senderWallet.balance -= amount;
    //receiverWallet.balance += amount;
    receiverWallet.balance = Number(receiverWallet.balance) + Number(amount);

    await senderWallet.save();
    await receiverWallet.save();

    // Log transaction

    const transaction = new Transaction({
      sender: senderId,
      receiver: receiver._id,
      amount,
    });

    await transaction.save();
    // await Transaction.create({
    //   sender: senderId,
    //   receiver: receiver._id,
    //   amount,
    // });

    await sendEmail(
      receiver.email,
      "You received a transfer",
      `<p>Hi ${receiver.userName},</p><p>You have received ₦${amount} from ${sender.userName}. Your new wallet balance is ₦${receiverWallet.balance}.</p>`
    );

    await sendSMS(
      receiver.phoneNumber,
      `💰 You received ₦${amount} from ${sender.userName}. Balance: ₦${receiverWallet.balance}`
    );

    await sendEmail(
      sender.email,
      "You sent a transfer",
      `<p>Hi ${sender.userName},</p><p>You sent ₦${amount} to ${receiver.userName}. Your new wallet balance is ₦${senderWallet.balance}.</p>`
    );

    await sendSMS(
      sender.phoneNumber,
      `✅ You sent ₦${amount} to ${receiver.userName}. Balance: ₦${senderWallet.balance}`
    );

    res.status(200).json({
      msg: "Transfer successful",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleGetWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user });

    if (!wallet) {
      return res.status(404).json({ msg: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const handleGetTransactionHistory = async (req, res) => {
  try {
    const userId = req.user;

    // Find transactions where user is either sender or receiver
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "email") // Optional: get sender's email
      .populate("receiver", "email") // Optional: get receiver's email
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: error.message });
  }
};

//DELETE USER OR WALLET ACCOUNT, NOTE: ONLY ADMIN CAN DO THIS
const handleDeleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Check for email in request
    if (!email) {
      return res.status(400).json({ msg: "User email is required" });
    }

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete user's wallet
    await Wallet.deleteOne({ user: user._id });

    /* 
    Optionally delete user's transactions
    await Transaction.deleteMany({
      $or: [{ sender: user._id }, { receiver: user._id }],
    });
    */

    // Delete user account
    await User.deleteOne({ _id: user._id });

    res
      .status(200)
      .json({ msg: `User with email ${email} has been deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = {
  handleAddMoney,
  handleTransferMoney,
  handleGetWalletBalance,
  handleGetTransactionHistory,
  handleDeleteUser,
};
