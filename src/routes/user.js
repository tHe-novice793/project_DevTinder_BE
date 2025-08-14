import express from "express";
import { userAuth } from "../middlewares/auth.js";
import ConnectionRequestModel from "../models/connectionRequest.js";
import { UserModel } from "../models/user.js";
import mongoose from "mongoose";

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
      success: true,
      message: "Connection requests fetched",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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

    res.json({ success: true, data: connections });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    let {
      search,
      gender,
      minAge,
      maxAge,
      page = 1,
      limit = 10,
      sortBy,
      order = "desc",
    } = req.query;

    limit = limit > 50 ? 50 : parseInt(limit);
    page = parseInt(page);
    const skip = (page - 1) * limit;

    // Find all user IDs involved in requests with logged-in user
    const sentRequests = await ConnectionRequestModel.find({
      fromUserId: loggedInUserId,
    })
      .select("toUserId")
      .lean();
    const receivedRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUserId,
    })
      .select("fromUserId")
      .lean();

    const excludedUserIds = [
      ...sentRequests.map((r) => r.toUserId),
      ...receivedRequests.map((r) => r.fromUserId),
    ];

    const matchStage = {
      _id: {
        $ne: new mongoose.Types.ObjectId(loggedInUserId),
        $nin: excludedUserIds,
      },
    };

    if (search) {
      matchStage.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { about: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (gender) matchStage.gender = gender;

    if (minAge || maxAge) {
      matchStage.age = {};
      if (minAge) matchStage.age.$gte = parseInt(minAge);
      if (maxAge) matchStage.age.$lte = parseInt(maxAge);
    }

    const loggedInUser = await UserModel.findById(loggedInUserId).select(
      "skills"
    );

    let sortStage = { createdAt: -1 };
    if (sortBy) {
      const sortOrder = order === "asc" ? 1 : -1;
      sortStage = { [sortBy]: sortOrder };
    }

    const users = await UserModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          skillMatchCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$skills", []] },
                loggedInUser.skills || [],
              ],
            },
          },
        },
      },
      {
        $addFields: {
          mutualConnectionsCount: { $literal: 0 },
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ]);

    res.json({
      success: true,
      page,
      limit,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error in /feed:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { userRouter };
