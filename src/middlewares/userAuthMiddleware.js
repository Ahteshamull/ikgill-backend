import jwt from "jsonwebtoken";
import userModal from "../models/auth/userModal.js";
import userRoleModel from "../models/users/userRoleModal.js";

const userAuthMiddleware = async (req, res, next) => {
  // Prefer Authorization header, fallback to httpOnly cookie
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const token = bearerToken || req.cookies?.accessToken;

  if (!token) {
    return res.status(401).send({ success: false, message: "Unauthorized: access token not provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.PRV_TOKEN
    );

    // Try to find user in role-based collection first
    let user = await userRoleModel.findById(decoded._id).select("-password");

    // Fallback to auth user collection (backward compatibility)
    if (!user) {
      user = await userModal.findById(decoded._id).select("-password");
    }

    if (!user) {
      return res.status(401).send({ success: false, message: "Unauthorized: user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).send({ success: false, message: "Unauthorized: token expired" });
    }
    return res.status(401).send({ success: false, message: "Unauthorized: invalid token" });
  }
};

export default userAuthMiddleware;
