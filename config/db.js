import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to mongo database");
  } catch (error) {
    console.error("❌ Mongodb connection error", error);
    process.exit(1);
  }
};
