import { Router } from "express";
import { authUser } from "../middlewares/auth.js";
import { createAccount, login, logout } from "../controllers/authController.js";

const router = Router()

router.post("/create-account", createAccount);
router.post("/login", login);
router.post("/logout", authUser, logout);

export default router