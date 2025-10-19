import jwt from "jsonwebtoken";
import userModal from "../models/auth/userModal.js";
import userRoleModel from "../models/users/userRoleModal.js";

const userAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ success: false, message: "Token Not Found" });
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
      return res.status(401).send({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).send({
      success: false,
      message: "Unauthorized, JWT token is wrong or expired",
    });
  }
};

export default userAuthMiddleware;
