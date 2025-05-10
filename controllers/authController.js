import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { User } from "../models/User.js";

// Register
export const createAccount = async (req, res, next) => {
    const { username, firstName, lastName, email, password } = req.body;

    if (!username || !firstName || !lastName || !validator.isEmail(email) || !password) {
        return next(new Error("Invalid input"));
    }

    if (!validator.isStrongPassword(password)) {
        return next(new Error("Weak password"));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return next(new Error("User exists"));
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await user.save();

        res.json({
            error: false,
            message: "Registration successful. Please log in to continue."
        });
    } catch (error) {
        next(error)
    }
};

// Login
export const login = async (req, res, next) => {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
        return next(new Error("Email/Username and password required"));
    }

    try {
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            return next(new Error("User not found"));
        }

        const isValid = user && await bcrypt.compare(password, user.password);

        if (!isValid) {
            return next(new Error("Invalid credentials"));
        }

        const payload = {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 1 * 60 * 60 * 1000,
        }).json({
            error: false,
            user: payload,
            accessToken,
            message: "Login successfully"
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
        sameSite: "Strict"
    });

    res.json({
        error: false,
        message: "Logged out successfully"
    });
};
