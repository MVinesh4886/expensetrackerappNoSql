const User = require("../model/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

// Register User route
const RegisterUser = async (req, res) => {
  const { name, emailId, password } = req.body;
  try {
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createUser = await User.create({
      name,
      emailId,
      password: hashedPassword,
    });

    const Token = generateToken(createUser);
    console.log(Token);

    await createUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vineshkrishna26@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "vineshkrishna26@gmail.com",
      to: emailId,
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link: http://localhost:8000/user/verifyEmail/${Token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Email sent" });
      }
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully, Please verify your email",
      data: createUser,
      token: Token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login route
const LoginUser = async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const existingUser = await User.findOne({ emailId });

    // let isPremiumUser = null;

    if (existingUser) {
      // if the existing user is not verified
      if (!existingUser.isVerified) {
        return res.status(401).json({
          success: false,
          message: "Email not verified. Please verify your email first.",
        });
      }
      const isPasswordMatched = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (isPasswordMatched) {
        existingUser.isPremiumUser = false;
        await existingUser.save();
        const Token = generateToken(existingUser);

        // Update the user's token in the database or local storage
        existingUser.token = Token;
        await existingUser.save();
        const userId = existingUser.id;
        console.log(`The current logged in User is : `, userId);

        return res.status(200).json({
          success: true,
          message: "User LoggedIn Successfully",
          data: existingUser,
          token: Token,
        });
      }
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid login credentials" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Email verification
const VerifyEmail = async (req, res) => {
  const token = req.params.Token;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.id;
    const user = await User.findById(userId);
    console.log(user);

    user.isVerified = true;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

const GetAllUsers = async (req, res) => {
  try {
    const getUser = await User.find().populate("expenses");
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: getUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const ForgotPassword = async (req, res) => {
  const { emailId } = req.body;

  try {
    // Find the user by their email
    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique token for the password reset link
    const Token = generateToken({ userId: user._id });
    console.log(Token);

    // Save the token in the user's record in the database
    user.resetPasswordToken = Token;
    await user.save();

    // Send an email to the user with the password reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vineshkrishna26@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "vineshkrishna26@gmail.com",
      to: emailId,
      subject: "Reset Your Password",
      // text: `http://127.0.0.1:5501/Backend/Frontend/ResetPassword.html`,
      text: `http://localhost:8000/ResetPassword.html`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Email sent" });
      }
    });
  } catch (error) {
    console.log("Error initiating password reset:", error);
    res.status(500).json(error);
  }
};

// Reset password
const ResetPassword = async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully", user });
  } catch (error) {
    console.log("Error resetting password:", error);
    res.status(500).json(error);
  }
};

const GetSingleUser = async (req, res) => {
  try {
    const id = req.params.id;
    const getUser = await User.findById(id);
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: getUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const DeleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};
