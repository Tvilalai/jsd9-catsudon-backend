import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(403)
      .json({ error: true, message: "Access denied. No token provided" });
  }

  try {
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded_token._id };
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
