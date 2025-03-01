const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Validating email address and domain
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.endsWith("@iiitm.ac.in");
}

// Login Route
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter both your email and password" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please login with email of iiitm.ac.in domain" });
    }

    const foundUser = await db.User.findOne({ email });

    if (!foundUser) {
      return res
        .status(400)
        .json({ message: "Email not associated with any account" });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email or Password is incorrect." });
    }

    const token = jwt.sign(
      { id: foundUser._id, email: foundUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.status(200).json({ token, userId: foundUser._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
};

// Forgot Password Route
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Please enter your registered email address." });
    }

    const user = await db.User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist." });
    }

    const token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "20m",
    });

    await user.updateOne({ resetLink: token });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_ID,
      to: email,
      subject: "Password Reset Link",
      text: `Click the link to reset your password: \nhttp://${req.headers.host}/api/user/resetPassword/${token}\nThe link will expire in 20 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Password reset link sent to ${email}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
};

// Reset Password Route
const resetPassword = async (req, res) => {
  try {
    const { resetLink, newPassword } = req.body;

    if (!resetLink || !newPassword) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const decoded = jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY);
    const user = await db.User.findOne({ _id: decoded._id, resetLink });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetLink = "";
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
};

// Add Admin Route
const addAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Only iiitm.ac.in domain emails are allowed." });
    }

    const existingUser = await db.User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new db.User({ email, password: hashedPassword });

    await newUser.save();

    res.status(200).json({ message: "Admin added successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
};

// Ensure default admin exists
db.User.find().exec(async (err, results) => {
  if (err) return console.error(err);

  if (results.length === 0) {
    try {
      const hashedPassword = await bcrypt.hash("abc", 10);
      const user = new db.User({
        email: "imt_2018109@iiitm.ac.in",
        password: hashedPassword,
        isVerified: true,
      });
      await user.save();
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  }
});

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  addAdmin,
};
