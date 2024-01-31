const express = require("express");

const isLogin = require("../middlewares/auth");

const {
  createExpense,
  getAllExpense,
  getSingleExpense,
  deleteExpense,
  updateExpense,
  deleteAllExpenses,
  Download,
  ShowLeaderBoard,
} = require("../controllers/expense");
const router = express.Router();

router.post("/create", isLogin, createExpense);
router.get("/get", isLogin, getAllExpense);
router.get("/get/:id", isLogin, getSingleExpense);
router.put("/update/:id", isLogin, updateExpense);
router.delete("/delete/:id", isLogin, deleteExpense);
router.delete("/delete", deleteAllExpenses);

router.get("/showleaderboard", isLogin, ShowLeaderBoard);

router.get("/download", isLogin, Download);

module.exports = router;
