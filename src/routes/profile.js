import express from "express";
import { userAuth } from "../middlewares/auth.js";
import {
  validateEditPasswordData,
  validateProfileEditData,
} from "../utils/validaton.js";
import { UserModel } from "../models/user.js";
import bcrypt from "bcrypt";

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User does not exist");
    }
    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    // Validate the profile edit data
    const validation = validateProfileEditData(req);
    if (!validation.isValid) {
      throw new Error(`Invalid fields: ${validation.invalidFields.join(", ")}`);
    }

    const loggedInUser = req.user;
    const updateData = {};

    for (let key of Object.keys(req.body)) {
      if (req.body[key]) {
        updateData[key] = req.body[key];
      }
    }

    // Update the user's profile in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      loggedInUser._id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found or failed to update profile.");
    }

    res.json({
      success: true,
      message: `${updatedUser.firstName}, your profile updated successfully`,
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

profileRouter.patch("/editPassword", userAuth, async (req, res) => {
  try {
    const { emailId, password } = await validateEditPasswordData(req);

    const newPassword = await bcrypt.hash(password, 10);
    const loggedInUser = await UserModel.findOne({ emailId: emailId });
    if (!loggedInUser) {
      throw new Error("Invalid user credentials");
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      loggedInUser._id,
      { password: newPassword },
      { new: true }
    );
    res.json({
      success: true,
      message: "Password changed successfully!",
      user: updatedUser,
    });
  } catch (err) {
    // Handle errors, e.g., user not found, invalid password, etc.
    res.status(400).json({ success: false, message: err.message });
  }
});

export { profileRouter };
