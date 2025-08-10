import express from "express";
import bcrypt from "bcrypt";
import { userAuth } from "./middlewares/auth.js";
import { connectDB } from "./config/database.js";
import { UserModel } from "./models/user.js";
import { validateLoginData, validateSignupData } from "./utils/validaton.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const User = UserModel;
// const connectDB = connectDB();

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignupData(req);

    // Encrypt the password
    const { firstName, lastName, emailId, password } = req.body;
    const paswordHash = await bcrypt.hash(password, 10);
    console.log(paswordHash);

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
app.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid login credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 3600000),
      });

      res.send("User login successfull!!! Hello " + user.firstName);
    } else {
      throw new Error("Invalid login credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send("User is : " + user);
  } catch (err) {
    res.status(400).send("Error occured " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  console.log("Sending a connection request");
  res.send(user.firstName + ` sent a connection request!!`);
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(3000, () => {
      console.log("Server is running on 3000");
    });
  })
  .catch((err) => {
    console.error("Database canot be connected!!");
  });
