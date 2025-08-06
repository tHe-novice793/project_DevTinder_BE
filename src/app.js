import express from "express";
import { adminAuth, userAuth } from "./middlewares/auth.js";
import { connectDB } from "./config/database.js";
import { UserModel } from "./models/user.js";

const app = express();
const User = UserModel;
// const connectDB = connectDB();

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "Mario",
    lastName: "Doe",
    emailId: "Mariodoe@gmail.com",
    password: "Mario@123",
  });

  try {
    await user.save();
    res.send("User added successfully");
  } catch (error) {
    res.status(400).send("Error while saving the user:" + err.message);
  }
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
