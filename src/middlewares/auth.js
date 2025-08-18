import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { UserModel } from "../models/user.js";

configDotenv();
const User = UserModel;

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please login.");
    }

    const decodedObj = await jwt.verify(token, process.env.SECRET_KEY);

    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    // Handle errors based on error type
    if (err.name === "JsonWebTokenError") {
      return res.status(400).send("Invalid token");
    } else if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token expired");
    }
    res.status(500).send("Server error: " + err.message);
  }
};

export { userAuth };
