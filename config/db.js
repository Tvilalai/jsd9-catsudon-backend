import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅connected to mongo database ");
  } catch (error) {
    console.error("❌mongodb connection error", error);
    process.exit(1);
  }
};
