const Expense = require("../model/expense");
const User = require("../model/user");

const mongoose = require("mongoose");
const AWS = require("aws-sdk");

const createExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category,
      user: req.user,
    });

    const user = await User.findById(req.user);
    const totalAmount = Number(user.totalExpenses) + Number(amount);
    user.totalExpenses = totalAmount;
    user.expenses.push(expense);

    await user.save();
    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
};

// to get all expenses
const getAllExpense = async (req, res) => {
  try {
    const getTracker = await Expense.find();
    res.status(200).json({
      success: true,
      data: getTracker,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
};

// //to get a single expense
const getSingleExpense = async (req, res) => {
  try {
    const tracker = await Expense.findById(req.params.id);
    //if there is no expense/tracker found
    if (!tracker) {
      return res.status(404).json({ message: "tracker not found" });
    }
    res.status(200).json({ data: tracker });
  } catch (error) {
    res.status(400).json({ message: "Internal server error" });
  }
};

//to update the expense
const updateExpense = async (req, res) => {
  try {
    const findExpense = await Expense.findById(req.params.id);
    if (!findExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }
    const { amount, description, category } = req.body;
    const updateExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, description, category },
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Expense updated successfully",
      data: updateExpense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAllExpenses = async (req, res) => {
  try {
    await Expense.deleteMany();
    const users = await User.find();
    users.forEach(async (user) => {
      user.expenses = [];
      user.totalExpenses = 0;
      await user.save();
    });
    res.status(200).json({
      success: true,
      message: "Expenses deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    const amount = expense.amount;

    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTotalExpenses = Number(user.totalExpenses) - Number(amount);
    user.totalExpenses = newTotalExpenses;

    user.expenses.pull(expense._id);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
};

const ShowLeaderBoard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    const leaderboard = await User.aggregate([
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          totalExpenses: 1,
        },
      },
      {
        $sort: {
          totalExpenses: -1,
        },
      },
      {
        $skip: page * size,
      },
      {
        $limit: size,
      },
    ]);

    res.json({ leaderboard });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function uploadToS3(data, filename) {
  const bucketName = "expensetrackerapp4321";
  const userKey = process.env.ACCESS_KEYID;
  const secretKey = process.env.SECRET_KEYID;

  const s3Bucket = new AWS.S3({
    accessKeyId: userKey,
    secretAccessKey: secretKey,
  });

  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  try {
    const s3response = await s3Bucket.upload(params).promise();
    console.log("Successfully uploaded", s3response);
    return s3response.Location; // Return the URL of the uploaded file
  } catch (err) {
    console.log("Something went wrong", err);
  }
}

const Download = async (req, res) => {
  try {
    const download = await User.find();
    console.log(download);
    const stringifiedExpenses = JSON.stringify(download);
    const filename = `Expense${req.user}/${new Date()}.txt`;

    const fileUrl = uploadToS3(stringifiedExpenses, filename);
    console.log(fileUrl);
    res.status(200).json({ fileUrl, success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createExpense,
  getAllExpense,
  getSingleExpense,
  deleteExpense,
  deleteAllExpenses,
  updateExpense,
  Download,
  ShowLeaderBoard,
};
