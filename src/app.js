import express from "express";
import { adminAuth, userAuth } from "./middlewares/auth.js";
import { connectDB } from "./config/database.js";
import { UserModel } from "./models/user.js";

const app = express();
const User = UserModel;
// const connectDB = connectDB();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error while saving the user:" + err.message);
  }
});

// Feed API - GET/feed - To get all the users from the database
app.get("/feed", async (req, res) => {
  // const userEmailId = req.body.emailId;

  try {
    const users = await User.find({});
    if (!users.length) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!!", err.message);
  }
});

// Delete API - DELETE/user - To delete the user
app.delete("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  console.log(userEmail);
  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      return res.status(404).send("User not found.");
    }
    await User.findByIdAndDelete(user._id);
    res.send("User is deleted successfully.");
  } catch (err) {
    res.status(400).send("Something went wrong !!");
  }
});

// Update API - PATCH/user - To update the user
app.patch("/user", async (req, res) => {
  // console.log("Received body:", req.body);
  const { emailId, ...updateFields } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(404).send("User not found.");
    }
    const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ message: "User is updated successfully.", user: updatedUser });
  } catch (err) {
    res.status(400).send("Something went wrong !!");
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
