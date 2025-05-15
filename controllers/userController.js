import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Menu } from "../models/Menu.js";

/* ========================= User ============================ */
// User
const getCurrentUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.user;

    if (!userId) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
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
  try {
    const { user } = req.user;
    const dataToUpdate = req.body;

    if (user.role !== "admin" && Object.hasOwn(dataToUpdate, "role")) {
      const error = new Error("You cannot edit 'role'");
      error.statusCode = 403;
      return next(error);
    }
    const userToUpdate = await User.findById(user._id);
    if (!userToUpdate) {
      return next(
        Object.assign(new Error("User not found"), { statusCode: 404 })
      );
    }

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
  try {
    const { user } = req.user;
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

// Cart
const getCart = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.user;
    const user = await User.findById(userId);
    if (!user) {
      return next(
        Object.assign(new Error("User not found"), { statusCode: 404 })
      );
    }
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
  try {
    const { _id: userId } = req.user.user;
    const { menuId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    let newCartItem;
    const existingItem = user.cart.find(
      (item) => item.menuId.toString() === menuId
    );
    if (existingItem) {
      existingItem.quantity += 1;
      newCartItem = existingItem;
    } else {
      const menu = await Menu.findById(menuId);
      if (!menu) {
        const error = new Error("Menu not found");
        error.statusCode = 404;
        return next(error);
      }
      newCartItem = {
        menuId: menu._id,
        name: menu.name,
        servingSize: menu.servingSize,
        price: menu.price,
        quantity: 1,
        imageUrl: menu.imageUrl,
      };
      user.cart.push(newCartItem);
    }

    await user.save();
    res.status(201).json({
      error: false,
      message: "Item added to cart successfully",
      cart: user.cart,
      item: newCartItem,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
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
      item,
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.user;
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      const error = new Error("Invalid item ID");
      error.statusCode = 404;
      return next(error);
    }
    const user = await User.findById(userId);
    const itemIndex = user.cart.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      const error = new Error("Item not found in your cart");
      error.statusCode = 404;
      return next(error);
    }
    user.cart.splice(itemIndex, 1);
    await user.save();

    res.json({
      error: false,
      message: "Item deleted successfully",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.user;
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
      message: "Your cart is empty 🛒",
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

// Address
const getAddress = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.user;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      error: false,
      message: "Retrived user address successfully",
      address: user.address,
    });
  } catch (error) {
    next(error);
  }
};

const addNewAddress = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.user;
    const { name, phone, street, district, province, postalCode } = req.body;

    if (!phone || !street || !district || !province || !postalCode) {
      const error = new Error("Please provide all fields");
      error.statusCode = 400;
      return next(error);
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    user.address.push({
      name: name || `${user.firstName} ${user.lastName}`,
      phone,
      street,
      district,
      province,
      postalCode,
    });
    await user.save();

    res.status(201).json({
      error: false,
      message: "Your address added successfully",
      address: user.address,
    });
  } catch (error) {
    next(error);
  }
};

const editAddress = async (req, res, next) => {
  const { _id: userId } = req.user.user;
  const { addressId } = req.params;
  const { name, phone, street, district, province, postalCode } = req.body;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    const error = new Error("Invalid address ID");
    error.statusCode = 400;
    return next(error);
  }

  if (!phone || !street || !district || !province || !postalCode) {
    const error = new Error("Please provide all fields");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const addressIndex = user.address.findIndex(
      (address) => address._id.toString() === addressId
    );
    if (addressIndex === -1) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      return next(error);
    }

    user.address[addressIndex] = {
      name: name || `${user.firstName} ${user.lastName}`,
      phone,
      street,
      district,
      province,
      postalCode,
    };
    await user.save();

    res.json({
      error: false,
      message: "Your address updated successfully",
      address: user.address,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  const { _id: userId } = req.user.user;
  const { addressId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    const error = new Error("Invalid address ID");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const addressIndex = user.address.findIndex(
      (address) => address._id.toString() === addressId
    );
    if (addressIndex === -1) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      return next(error);
    }
    user.address.splice(addressIndex, 1);
    await user.save();

    res.json({
      error: false,
      message: "Your address has been deleted",
      address: user.address,
    });
  } catch (error) {
    next(error);
  }
};

/* ========================= Admin ============================ */
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
  getAddress,
  addNewAddress,
  editAddress,
  deleteAddress,
  getAllUsers,
  getOneUser,
  deleteUser,
};
