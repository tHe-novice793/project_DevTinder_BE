import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not a valid status`,
      },
      default: "interested",
    },
    matchedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Create a compound index on fromUserId and toUserId to ensure uniqueness
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // Check if the formUserId is same as toUserId
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("User cannot send request to themselves."));
  }
  next();
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

export default ConnectionRequestModel;
