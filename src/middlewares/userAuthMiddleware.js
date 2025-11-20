import jwt from "jsonwebtoken";
import userModal from "../models/auth/userModal.js";
import userRoleModel from "../models/users/userRoleModal.js";

const userAuthMiddleware = async (req, res, next) => {
  try {
    /** --------------------------
     * 1. Get Token from Multiple Sources
     * -------------------------- */
    const authHeader = req.headers.authorization || req.headers.Authorization;

    let token = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fallback options
    if (!token) token = req.cookies?.accessToken;
    if (!token) token = req.headers["x-access-token"];
    if (!token) token = req.query?.accessToken;

    /** NO TOKEN → BLOCK */
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token not provided",
      });
    }

    /** --------------------------
     * 2. Verify Token
     * -------------------------- */
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

    /** --------------------------
     * 3. Find User (Role User First → Auth User Fallback)
     * -------------------------- */
    let user =
      (await userRoleModel.findById(decoded._id).select("-password")) ||
      (await userModal.findById(decoded._id).select("-password"));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    /** Attach user to request */
    req.user = user;

    /** Continue */
    next();
  } catch (err) {
    console.error("Auth Error:", err);

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

export default userAuthMiddleware;
