import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;

const connectDB = async () => {
  await mongoose.connect(mongoUrl);
};

export { connectDB };
