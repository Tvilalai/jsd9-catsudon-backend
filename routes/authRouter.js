import { Router } from "express";
import { authUser } from "../middlewares/auth.js";
import {
  createAccount,
  login,
  logout,
  getUserInfo,
} from "../controllers/authController.js";

const router = Router();

router.post("/auth/create-accounts", createAccount);
router.post("/auth/login", login);
router.post("/auth/logout", authUser, logout);
router.get("/auth/user-info", authUser, getUserInfo);

export default router;
