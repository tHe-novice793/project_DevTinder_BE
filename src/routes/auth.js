import express from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.js";
import { validateLoginData, validateSignupData } from "../utils/validaton.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const authRouter = express.Router();
const User = UserModel;

// SignUp API - POST/signup - To sign up the user
authRouter.post("/signup", async (req, res) => {
  const token = req.cookies?.token;

  // ✅ Block signup if already logged in
  if (token) {
    try {
      jwt.verify(token, process.env.SECRET_KEY);
      return res
        .status(403)
        .json({ success: false, message: "Already logged in." });
    } catch (err) {
      // Token invalid — allow signup
      console.log("Invalid token during signup check:", err.message);
    }
  }

  try {
    // ✅ Validate input
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 12 * 3600000),
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: savedUser,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error during signup: " + err.message,
    });
  }
});

// Login API - POST/login - To login the user
authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid login credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 12 * 3600000),
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      res.json({
        success: true,
        message: `User login successful! Hello, ${user.firstName}`,
        data: user,
      });
    } else {
      throw new Error("Invalid login credentials");
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Logout API - POST/logout - To logout the user
authRouter.post("/logout", authenticateJWT, async (req, res) => {
  try {
    const userFirstName = req.user ? req.user.firstName : "Guest";
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });

    res.json({
      success: true,
      message: `${userFirstName} logged out successfully.`,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message, data: null });
  }
});

export { authRouter };
