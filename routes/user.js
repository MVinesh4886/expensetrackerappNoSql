const express = require("express");
const router = express.Router();
const {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
} = require("../controllers/user");

router.post("/register", RegisterUser);

router.post("/login", LoginUser);

router.get("/verifyEmail/:Token", VerifyEmail);

router.get("/register", GetAllUsers);

router.post("/forgotPassword", ForgotPassword);

router.post("/resetPassword", ResetPassword);

router.get("/register/:id", GetSingleUser);

router.delete("/delete/:id", DeleteUser);

module.exports = router;
