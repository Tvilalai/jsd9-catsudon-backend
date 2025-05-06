import jwt from "jsonwebtoken";
export const authUser = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res
      .status(403)
      .json({ error: true, message: "access denied. no token" });
  }
  try {
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user: { _id: decoded_token.userId } };
    next();
  } catch (error) {
    const isExpired = error.name === "tokenExpiredError";
    res
      .status(401)
      .json({
        error: true,
        code: isExpired ? "token_expired" : "invalid_token",
        message: isExpired
          ? "token has expire,please log in again"
          : "invalid token",
      });
  }
};
