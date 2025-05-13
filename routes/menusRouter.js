import { Router } from "express";
import { getAllMenus, getMenuById } from "../controllers/menuController.js";

const router = Router();

// Route to get all menus
router.get("/menus", getAllMenus);

// Route to get a single menu by ID
router.get("/menus/:id", getMenuById);

export default router;
