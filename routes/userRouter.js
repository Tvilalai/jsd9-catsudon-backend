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
  getAddress,
  addNewAddress,
  editAddress,
  deleteAddress,
  getAllUsers,
  getOneUser,
  deleteUser,
} from "../controllers/userController.js";
import { authUser } from "../middlewares/auth.js";

const router = Router();

/* ========================= User-related routes =========================== */
// User
router.get("/users/me", authUser, getCurrentUser);
router.put("/users/me", authUser, updateUserInformation);
router.delete("/users/me", authUser, deleteCurrentUser);

// Cart
router.get("/users/me/cart", authUser, getCart);
router.post("/users/me/cart", authUser, addToCart);
router.delete("/users/me/cart", authUser, clearCart);
router.patch("/users/me/cart/item/:itemId", authUser, updateCartItem);
router.delete("/users/me/cart/item/:itemId", authUser, deleteCartItem);

// Address
router.get("/users/me/addresses", authUser, getAddress);
router.post("/users/me/addresses", authUser, addNewAddress);
router.put("/users/me/addresses/:addressId", authUser, editAddress);
router.delete("/users/me/addresses/:addressId", authUser, deleteAddress);

/* ========================= Admin-related route =========================== */
router.get("/users", authUser, getAllUsers);
router.get("/users/:userId", authUser, getOneUser);
router.delete("/users/:userId", authUser, deleteUser);

export default router;
