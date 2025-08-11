import express from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.js";
import { validateLoginData, validateSignupData } from "../utils/validaton.js";
import { userAuth } from "../middlewares/auth.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const authRouter = express.Router();
const User = UserModel;

// SignUp API - POST/signup - To sign up the user
authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignupData(req);

    // Encrypt the password
    const { firstName, lastName, emailId, password } = req.body;
    const paswordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: paswordHash,
    });
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error while saving the user: " + err.message);
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
        expires: new Date(Date.now() + 7 * 24 * 3600000),
        // httpOnly: true,
      });

      res.send(`User login successful! Hello, ${user.firstName}`);
    } else {
      throw new Error("Invalid login credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

// Logout API - POST/logout - To logout the user
authRouter.post("/logout", authenticateJWT, async (req, res) => {
  try {
    const userFirstName = req.user ? req.user.firstName : "Guest";
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });

    res.send(`${userFirstName}, you have been logged out successfully.`);
  } catch (err) {
    res.status(400).send(`Error : ${err.message}`);
  }
});



export { authRouter };
