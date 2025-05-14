import { Router } from "express";
import {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
} from "../controllers/menuController.js";
import { authUser } from "../middlewares/auth.js";

const router = Router();

// Route to get all menus
router.get("/menus", getAllMenus);

// Route to get a single menu by ID
router.get("/menus/:id", getMenuById);

// Route to create new menu
router.post("/menus", authUser, createMenu);

// Route to update a menu
router.put("/menus/:id", authUser, updateMenu);

// Route to delete a menu
router.delete("/menus/:id", authUser, deleteMenu);

export default router;
