import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { User } from "../models/User.js";

// Register (Create Account)
export const createAccount = async (req, res, next) => {
  const { username, role, firstName, lastName, email, password } = req.body;

  if (
    !username ||
    !firstName ||
    !lastName ||
    !validator.isEmail(email) ||
    !password
  ) {
    const error = new Error("Invalid input");
    error.statusCode = 400;
    return next(error);
  }

  if (!validator.isStrongPassword(password)) {
    const error = new Error("Weak password");
    error.statusCode = 400;
    return next(error);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User exists");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = new User({
      username,
      role,
      firstName,
      lastName,
      email,
      password,
    });

    await user.save();

    res.json({
      error: false,
      message: "Registration successful. Please log in to continue.",
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    const error = new Error("Email/Username and password required");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const isValid = user && (await bcrypt.compare(password, user.password));

    if (!isValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }

    const payload = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        error: false,
        user: payload,
        message: "Login successfully",
      });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({
    error: false,
    message: "Logged out successfully",
  });
};
