import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { UserModel } from "../models/user.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
import {
  validateReviewConnectionRequest,
  validateSendConnectionRequest,
} from "../utils/validaton.js";
import { run } from "../utils/sendEmail.js";

const requestRouter = express.Router();

const statusMessages = {
  interested: "showed interest in",
  ignored: "ignored",
  accepted: "matched with",
  rejected: "rejected",
};

const sendEmail = run();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Validate request parameters using the validation utility
    const { toUserId, status } = await validateSendConnectionRequest(req);

    // Check if the user to send the request to exists
    const userExists = await UserModel.findById(toUserId);
    if (!userExists) {
      throw new Error("The user doesn't exist");
    }

    // From user is already attached to `req.user` by the `userAuth` middleware
    const fromUserId = req.user._id;
    const toUser = await UserModel.findById(toUserId);

    const existingConnectionRequest = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId }, // fromUserId -> toUserId
        { fromUserId: toUserId, toUserId: fromUserId }, // toUserId -> fromUserId
      ],
    });

    if (existingConnectionRequest) {
      throw new Error("Connection request already exists between these users");
    }

    // Create the new connection request document
    const connectionRequest = new ConnectionRequestModel({
      fromUserId,
      toUserId,
      status,
    });

    // Save the request to the database
    const data = await connectionRequest.save();

    const emailRes = await sendEmail.run();
    console.log(emailRes)

    res.json({
      success: true,
      message: `${req.user.firstName} ${statusMessages[status]} ${userExists.firstName}`,
      data,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Connection request already exists.",
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { requestId, status } = await validateReviewConnectionRequest(req);

    // Only allow accepted or rejected on review
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status for review." });
    }

    // Fetch the original connection request which is still 'interested'
    const connectionRequest = await ConnectionRequestModel.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    const fromUserId = connectionRequest.fromUserId;

    // Check if the sender has previously ignored the logged-in user
    const wasIgnoredBySender = await ConnectionRequestModel.findOne({
      fromUserId: fromUserId,
      toUserId: loggedInUser._id,
      status: "ignored",
    });

    if (wasIgnoredBySender) {
      return res.status(403).json({
        success: false,
        message: "This connection request is no longer available.",
      });
    }

    // Update the request status
    connectionRequest.status = status;

    // If accepted, check if the sender also accepted logged-in user
    if (status === "accepted") {
      const now = new Date();
      connectionRequest.matchedAt = now;
    }
    const data = await connectionRequest.save();

    res
      .status(200)
      .json({ success: true, message: `Connection request ${status}.`, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export { requestRouter };
