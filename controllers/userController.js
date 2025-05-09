import { User } from "../models/User.js";

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({ error: false, users });
  } catch (err) {
    next(err);
  }
};

export { getAllUsers };
