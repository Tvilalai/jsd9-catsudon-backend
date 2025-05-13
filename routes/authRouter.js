import { Router } from "express";
import { authUser } from "../middlewares/auth.js";
import { createAccount, login, logout, getUserInfo } from "../controllers/authController.js";

const router = Router()

router.post("/create-account", createAccount);
router.post("/login", login);
router.post("/logout", authUser, logout);
router.get("/user-info", authUser, getUserInfo); 

export default router