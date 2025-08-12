import express from "express";
import { userAuth } from "../middlewares/auth.js";
import ConnectionRequestModel from "../models/connectionRequest.js";

const userRouter = express.Router();
const USER_SAFE_DATA = "firstName lastName photoUrl age gender skills about";

// Get all the pending interested connection request for the loggedIn user
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Connection request are fetched",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/connection", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const connectionRequests = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUserId, status: "accepted" },
        { fromUserId: loggedInUserId, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA)
      .lean();

    const connections = connectionRequests.map((row) => {
      // Return the user on the other side of the connection
      if (row.fromUserId._id.toString() === loggedInUserId.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ connections });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

export { userRouter };
