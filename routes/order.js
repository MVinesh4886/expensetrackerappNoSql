const express = require("express");

const isLogin = require("../middlewares/auth");
const {
  getPurchasePremium,
  updateTransactionStatus,
  deleteAllOrders,
} = require("../controllers/order");

const router = express.Router();

router.get("/purchasePremium", isLogin, getPurchasePremium);
router.post("/updateTransactionStatus", isLogin, updateTransactionStatus);
router.delete("/delete", deleteAllOrders);

module.exports = router;
