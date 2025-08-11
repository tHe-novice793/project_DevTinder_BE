import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { UserModel } from "../models/user.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
import { validateSendConnectionRequest } from "../utils/validaton.js";

const requestRouter = express.Router();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  const statusMessages = {
    interested: "showed interest in",
    accepted: "accepted",
    rejected: "rejected",
    ignored: "ignored",
  };
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

    res.json({
      message: `${req.user.firstName} ${statusMessages[status]} ${userExists.firstName}`,
      data,
    });
  } catch (err) {
    // Handle duplicate request error
    if (err.code === 11000) {
      // 11000 is the error code for duplicate key errors
      res.status(400).send("ERROR: Connection request already exists.");
    } else {
      res.status(400).send(`ERROR: ${err.message}`);
    }
  }
});

export { requestRouter };
