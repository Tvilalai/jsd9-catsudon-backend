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
    const error = new Error("Weak password. Please choose a stronger password.");
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

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
};

// Login
export const login = async (req, res, next) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return next(Object.assign(new Error("Email/Username and password required"), { statusCode: 400 }));
    }

    try {
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        });

        if (!user) {
            return next(Object.assign(new Error("User not found"), { statusCode: 404 }));
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return next(Object.assign(new Error("Invalid credentials"), { statusCode: 401 }));
        }

        const payload = {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

        res.cookie("accessToken", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            error: false,
            user: payload,
            accessToken: token,
            message: "Login successfully",
        });

    } catch (error) {
        next(error);
    }
  
// Logout
export const logout = (req, res) => {
    res.clearCookie("accessToken", { ...cookieOptions, path: '/' });
    res.json({
        error: false,
        message: "Logged out successfully",
    });

};

// Get User info
export const getUserInfo = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        res.json({ error: false, user });
    } catch (err) {
        console.error("Error fetching user info:", err);
        next(err);
    }
};
