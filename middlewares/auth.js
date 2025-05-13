import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized - No Token" });
    }

    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      user: {
        _id: decoded_token._id,
        email: decoded_token.email,
        username: decoded_token.username,
        role: decoded_token.role,
      },
    };
    next();
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError";
    res.status(401).json({
      error: true,
      code: isExpired ? "token_expired" : "invalid_token",
      message: isExpired
        ? "Token has expired, please log in again."
        : "Invalid token.",
    });
  }
};
