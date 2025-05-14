import dotenv from "dotenv";
import express from "express";
import { connectMongo } from "./config/db.js";
import apiRouter from "./routes/apiRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import limiter from "./middlewares/rateLimiter.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);

app.use(helmet());
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://jsd9-catsudon-frontend.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

app.use("/calnoy-api/v1", apiRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  connectMongo();
  console.log(`✅ Server Running on http://localhost:${PORT}`);
});
