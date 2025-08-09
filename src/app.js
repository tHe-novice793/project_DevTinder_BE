import express from "express";
import bcrypt from "bcrypt";
import { adminAuth, userAuth } from "./middlewares/auth.js";
import { connectDB } from "./config/database.js";
import { UserModel } from "./models/user.js";
import { validateLoginData, validateSignupData } from "./utils/validaton.js";

const app = express();
const User = UserModel;
// const connectDB = connectDB();

app.use(express.json());

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

    console.log(emailId, password);
    if (!user) {
      throw new Error("Invalid login credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.send("User login successfull!!!");
    } else {
      throw new Error("Invalid login credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
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
  const userEmail = req.body.emailId.toLowerCase().trim();
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
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const { emailId, ...updateFields } = req.body;

  const allowedUpdates = [
    "photoUrl",
    "about",
    "gender",
    "about",
    "age",
    "skills",
  ];

  try {
    const updateKeys = Object.keys(updateFields);

    const isUpdateAllowed = updateKeys.every((k) => {
      return allowedUpdates.includes(k);
    });

    if (!isUpdateAllowed) {
      return res.status(400).send("Update is not allowed.");
    }

    const user = await User.findOne({ emailId: emailId.toLowerCase().trim() });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    if (updateFields.skills) {
      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { skills: { $each: updateFields.skills } } },
        { new: true, runValidators: true }
      );
    } else {
      // If no 'skills' in updateFields, proceed with regular update
      await User.findByIdAndUpdate(user._id, updateFields, {
        new: true,
        runValidators: true,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ message: "User is updated successfully.", user: updatedUser });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(400).send("Something went wrong !!" + err.message);
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
