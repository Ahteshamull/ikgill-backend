import jwt from "jsonwebtoken";
import userRoleModel from "../models/users/userRoleModal.js";

const labManagerAuth = async (req, res, next) => {
  try {
    // Get token from multiple sources
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) token = req.cookies?.accessToken;
    if (!token) token = req.headers["x-access-token"];
    if (!token) token = req.query?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.PRV_TOKEN
    );

    if (!decoded?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token payload",
      });
    }

    // Find user
    const user = await userRoleModel.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // Check if user is lab manager
    if (user.role !== "labmanager") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only lab managers can access this",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Lab Manager Auth Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

export default labManagerAuth;
