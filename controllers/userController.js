import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Menu } from "../models/Menu.js";

// =========================User============================
const getCurrentUser = async (req, res, next) => {
  const { user } = req.user;

  if (!user || !user._id) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const hasUser = await User.findById(user._id);
    if (!hasUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    res.json({
      error: false,
      message: "Retrieved current user successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserInformation = async (req, res, next) => {
  const { user } = req.user;
  const dataToUpdate = req.body;

  if (user.role !== "admin" && Object.hasOwn(dataToUpdate, "role")) {
    const error = new Error("You cannot edit 'role'");
    error.statusCode = 403;
    return next(error);
  }

  try {
    const userToUpdate = await User.findById(user._id);
    if (!userToUpdate) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    Object.assign(userToUpdate, dataToUpdate); // copied dataToUpdate properties (source) and assign them into userToUpdate (target)
    await userToUpdate.save();

    res.json({
      error: false,
      message: "User information updated successfully",
      user: userToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCurrentUser = async (req, res, next) => {
  const { user } = req.user;

  try {
    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .json({
        error: false,
        message: "Your account has been deleted. You have been signed out.",
      });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  const { _id: userId } = req.user.user;

  try {
    const user = await User.findById(userId);
    if (!user.cart || user.cart.length === 0) {
      return res.json({ error: false, message: "Your cart is empty 🛒" });
    }
    res.json({
      error: false,
      message: "Retrived cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  const { _id: userId } = req.user.user;
  const itemToAdd = req.body;

  if (
    !itemToAdd.menuId ||
    !itemToAdd.name ||
    !itemToAdd.price ||
    !itemToAdd.imageUrl
  ) {
    const error = new Error("Please provide all fields.");
    error.statusCode = 400;
    return next(error);
  }

  if (itemToAdd.quantity < 1) {
    const error = new Error("Item quantity cannot be less than 1");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = await User.findById(userId);

    const existingItem = user.cart.find(
      (item) => item.menuId.toString() === itemToAdd.menuId
    );
    if (existingItem) {
      existingItem.quantity += itemToAdd.quantity;
    } else {
      const menu = await Menu.findById(itemToAdd.menuId);
      if (!menu) {
        const error = new Error("Menu not found");
        error.statusCode = 404;
        return next(error);
      }
      user.cart.push({
        menuId: menu._id,
        name: menu.name,
        price: menu.price,
        quantity: itemToAdd.quantity,
        imageUrl: menu.imageUrl,
      });
    }

    await user.save();
    res.status(201).json({
      error: false,
      message: "Item added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  const { _id: userId } = req.user.user;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const error = new Error("Invalid Item ID");
    error.statusCode = 400;
    return next(error);
  }

  if (typeof quantity !== "number") {
    const error = new Error("Quantity must be a number");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const itemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      const error = new Error("Item not found in your cart");
      error.statusCode = 404;
      return next(error);
    }

    const item = user.cart[itemIndex];

    if (item.quantity === quantity) return;
    if (quantity <= 0) {
      user.cart.splice(itemIndex, 1);
    } else {
      item.quantity = quantity;
    }

    await user.save();
    res.json({
      error: false,
      message: "Cart updated successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  const { _id: userId } = req.user.user;
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const error = new Error("Invalid item ID");
    error.statusCode = 404;
    return next(error);
  }

  try {
    const user = await User.findById(userId);
    user.cart = user.cart.filter((item) => item._id.toString() !== itemId);
    await user.save();

    res.json({
      error: false,
      message: "Item deleted successfully",
      cart: filteredCart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  const { _id: userId } = req.user.user;

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    user.cart = [];
    await user.save();

    res.json({
      error: false,
      message: "Cart cleared successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

// =========================Admin============================
const getAllUsers = async (req, res, next) => {
  const { user } = req.user;

  if (user.role !== "admin") {
    const error = new Error("Access denied. No permission");
    error.statusCode = 403;
    return next(error);
  }

  try {
    const users = await User.find().select("-password");
    res.json({ error: false, users });
  } catch (error) {
    next(error);
  }
};

const getOneUser = async (req, res, next) => {
  const { user } = req.user;
  const { userId } = req.params;

  if (user.role !== "admin") {
    const error = new Error("Access denied. No permission");
    error.statusCode = 403;
    return next(error);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user id");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json({ error: false, message: "Retrived user successfully", user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const { user } = req.user;
  const { userId } = req.params;

  if (user.role !== "admin") {
    const error = new Error("Access denied. No permission.");
    error.statusCode = 403;
    return next(error);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user id");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json({ error: false, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  getCurrentUser,
  updateUserInformation,
  deleteCurrentUser,
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  getAllUsers,
  getOneUser,
  deleteUser,
};
