const Razorpay = require("razorpay");
const Order = require("../model/order");
const User = require("../model/user");
const generateToken = require("../utils/generateToken");

const getPurchasePremium = async (req, res) => {
  try {
    var razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    const order = await razorpay.orders.create({
      amount, // Amount in paise (e.g., 2500 paise = Rs 25)
      currency: "INR",
    });

    await Order.create({
      orderId: order.id,
      status: "PENDING",
    });

    res.json({
      success: true,
      orderId: order.id,
      order,
      key_id: razorpay.key_id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to purchase premium",
    });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    const findOrder = await Order.findOne({ orderId });
    // findOrder.paymentId = paymentId;
    findOrder.status = "SUCCESSFUL";
    findOrder.user = req.user;
    await findOrder.save();

    const user = await User.findById(req.user);
    user.isPremiumUser = true; // Set the user as a premium user
    user.orders.push(findOrder);
    await user.save(); // Save the updated user

    const token = generateToken(user); // Generate a new token for the user

    return res.status(202).json({
      success: true,
      isPremiumUser: user.isPremiumUser,
      message: "Transactions updated successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res
      .status(401)
      .json({ error: error.message, message: "Something went wrong" });
  }
};

const deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany();
    const users = await User.find();
    users.forEach(async (user) => {
      user.orders = [];
      user.isPremiumUser = false;
      await user.save();
    });
    res.status(200).json({
      success: true,
      message: "Orders deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getPurchasePremium,
  updateTransactionStatus,
  deleteAllOrders,
};
