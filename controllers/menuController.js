import { Menu } from "../models/Menu.js";

// Get all menus //user
const getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find();
    res.json({ error: false, menus });
  } catch (err) {
    next(err);
  }
};

// Get a single menu by ID //user
const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: true, message: "Menu not found" });
    }
    res.json({ error: false, menu });
  } catch (err) {
    next(err);
  }
};

//create a new menu //admin
const createMenu = async (req, res, next) => {
  const { user } = req.user;
  if (user.role !== "admin") {
    const err = new Error("Access denined. No permission");
    err.status = 403;
    return next(err);
  }

  try {
    const newMenu = new Menu(req.body);
    await newMenu.save();
    res
      .status(201)
      .json({ error: false, message: "Menu created", menu: newMenu });
  } catch (err) {
    next(err);
  }
};

// Update an existing menu //admin
const updateMenu = async (req, res, next) => {
  const { user } = req.user;
  if (user.role !== "admin") {
    const err = new Error("Access denined. No permission");
    err.status = 403;
    return next(err);
  }

  try {
    const { id } = req.params;
    const updatedMenu = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedMenu) {
      return res.status(404).json({ error: true, message: "Menu not found" });
    }
    res.json({ error: false, message: "Menu updated", menu: updatedMenu });
  } catch (err) {
    next(err);
  }
};

// Delete a menu // admin
const deleteMenu = async (req, res, next) => {
  const { user } = req.user;
  if (user.role !== "admin") {
    const err = new Error("Access denined. No permission");
    err.status = 403;
    return next(err);
  }
  try {
    const { id } = req.params;
    const deletedMenu = await Menu.findByIdAndDelete(id);
    if (!deletedMenu) {
      return res.status(404).json({ error: true, message: "Menu not found" });
    }
    res.json({ error: false, message: "Menu deleted" });
  } catch (err) {
    next(err);
  }
};

export { getAllMenus, getMenuById, createMenu, updateMenu, deleteMenu };
