import { Menu } from "../models/Menu.js";

// Get all menus
const getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find();
    res.json({ error: false, menus });
  } catch (err) {
    next(err);
  }
};

// Get a single menu by ID
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

export { getAllMenus, getMenuById };
