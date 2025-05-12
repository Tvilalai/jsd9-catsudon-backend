import { Router } from "express";
import {
  getCurrentUser,
  updateUserInformation,
  deleteCurrentUser,
  getCart,
  addToCart,
  clearCart,
  updateCartItem,
  deleteCartItem,
  getAllUsers,
  getOneUser,
  deleteUser,
} from "../controllers/userController.js";
import { authUser } from "../middlewares/auth.js";

const router = Router();

// User-related routes
router.get("/users/me", authUser, getCurrentUser);
router.put("/users/me", authUser, updateUserInformation);
router.delete("/users/me", authUser, deleteCurrentUser);
router.get("/users/me/cart", authUser, getCart);
router.post("/users/me/cart", authUser, addToCart);
router.delete("/users/me/cart", authUser, clearCart);
router.patch("/users/me/cart/item/:itemId", authUser, updateCartItem);
router.delete("/users/me/cart/item/:itemId", authUser, deleteCartItem);

// Admin-related routes
router.get("/users", authUser, getAllUsers);
router.get("/users/:userId", authUser, getOneUser);
router.delete("/users/:userId", authUser, deleteUser);

export default router;
