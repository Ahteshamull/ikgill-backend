import jwt from "jsonwebtoken";
import User from "../models/auth/userModal.js";
import UserRole from "../models/users/userRoleModal.js";

// User role constants based on your flow
export const USER_ROLES = {
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
  DENTIST: "dentist",
  PRACTICE_MANAGER: "practice_manager",
  PRACTICE_NURSE: "practice_nurse",
  LAB_MANAGER: "lab_manager",
  LAB_TECHNICIAN: "lab_technician",
  LAB_QUALITY_CHECK: "lab_quality_check",
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    // TDK Management - Admin permissions
    permissions: ["ALL"],
    details: ["name", "email", "phone"],
    can: {
      createProfilesAll: true,
      removeProfilesAll: true,
      manageNotifications: true,
      accessAllCases: true,
      manageAllUsers: true,
    },
  },
  [USER_ROLES.SUPERADMIN]: {
    // Super Admin has all permissions
    permissions: ["ALL"],
    details: ["name", "email", "phone"],
    can: {
      createProfilesAll: true,
      removeProfilesAll: true,
      manageNotifications: true,
      accessAllCases: true,
      manageAllUsers: true,
      manageSystem: true,
    },
  },
  [USER_ROLES.DENTIST]: {
    // Clinic - Dentist permissions
    permissions: ["own_cases", "own_invoices", "own_archives", "start_case"],
    details: ["name", "email", "phone", "clinics", "gdc_no"],
    can: {
      accessOwnCases: true,
      accessOwnInvoices: true,
      accessOwnArchives: true,
      startCase: true,
      accessContactUs: true,
      accessDownloads: true,
      accessProfile: true,
    },
  },
  [USER_ROLES.PRACTICE_MANAGER]: {
    // Clinic - Practice Manager permissions
    permissions: [
      "all_clinic_cases",
      "all_clinic_invoices",
      "all_clinic_archives",
    ],
    details: ["name", "email", "phone", "clinic"],
    can: {
      accessAllClinicCases: true,
      accessAllClinicInvoices: true,
      accessAllClinicArchives: true,
      accessContactUs: true,
      accessDownloads: true,
      accessProfile: true,
    },
  },
  [USER_ROLES.PRACTICE_NURSE]: {
    // Clinic - Practice Nurse/Reception permissions
    permissions: ["all_clinic_cases", "all_clinic_archives"],
    details: ["email", "clinic"],
    can: {
      accessAllClinicCases: true,
      accessAllClinicArchives: true,
      accessContactUs: true,
      accessDownloads: true,
      accessProfile: true,
    },
  },
  [USER_ROLES.LAB_MANAGER]: {
    // Lab - Lab Manager permissions
    permissions: [
      "all_cases",
      "all_archives",
      "create_lab_profiles",
      "message_doctors",
    ],
    details: ["name", "email", "phone"],
    can: {
      accessAllCases: true,
      accessAllArchives: true,
      createTechnicianProfile: true,
      createQualityCheckProfile: true,
      messageDoctors: true,
      accessContactUs: true,
      accessDownloads: true,
      accessProfile: true,
    },
  },
  [USER_ROLES.LAB_TECHNICIAN]: {
    // Lab - Lab Technician permissions
    permissions: ["own_cases"],
    details: ["name", "email"],
    can: {
      accessOwnCases: true,
      accessContactUs: true,
      accessDownloads: true,
      accessProfile: true,
    },
  },
  [USER_ROLES.LAB_QUALITY_CHECK]: {
    // Lab - Lab Quality Check permissions
    permissions: ["all_cases"],
    details: ["name", "email"],
    can: {
      accessAllCases: true,
      accessContactUs: true,
      accessDownloads: true,
      accessProfile: true,
    },
  },
};

// Enhanced authentication middleware with role-based access
export const roleBasedAuth = (allowedRoles = [], requiredPermissions = []) => {
  return async (req, res, next) => {
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

      // Find user (check both User and UserRole models)
      let user =
        (await UserRole.findById(decoded._id).select("-password")) ||
        (await User.findById(decoded._id).select("-password"));

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: User not found",
        });
      }

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Insufficient role permissions",
          required: allowedRoles,
          current: user.role,
        });
      }

      // Check if user has required permissions
      if (requiredPermissions.length > 0) {
        const userPermissions = ROLE_PERMISSIONS[user.role]?.permissions || [];
        const hasAllPermissions = requiredPermissions.every(
          (perm) =>
            userPermissions.includes(perm) || userPermissions.includes("ALL")
        );

        if (!hasAllPermissions) {
          return res.status(403).json({
            success: false,
            message: "Forbidden: Insufficient permissions",
            required: requiredPermissions,
            current: userPermissions,
          });
        }
      }

      // Attach user and permissions to request
      req.user = user;
      req.userPermissions = ROLE_PERMISSIONS[user.role] || {};
      req.userRole = user.role;

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
};

// Specific role middleware functions for convenience
export const adminAuth = roleBasedAuth([
  USER_ROLES.ADMIN,
  USER_ROLES.SUPERADMIN,
]);
export const superAdminAuth = roleBasedAuth([USER_ROLES.SUPERADMIN]);
export const dentistAuth = roleBasedAuth([USER_ROLES.DENTIST]);
export const practiceManagerAuth = roleBasedAuth([USER_ROLES.PRACTICE_MANAGER]);
export const labManagerAuth = roleBasedAuth([USER_ROLES.LAB_MANAGER]);
export const labTechnicianAuth = roleBasedAuth([USER_ROLES.LAB_TECHNICIAN]);
export const labQualityCheckAuth = roleBasedAuth([
  USER_ROLES.LAB_QUALITY_CHECK,
]);

// Permission-based middleware
export const requirePermission = (permission) => {
  return roleBasedAuth([], [permission]);
};

// Clinic access middleware (for clinic-based roles)
export const clinicAuth = roleBasedAuth([
  USER_ROLES.DENTIST,
  USER_ROLES.PRACTICE_MANAGER,
  USER_ROLES.PRACTICE_NURSE,
]);

// Lab access middleware (for lab-based roles)
export const labAuth = roleBasedAuth([
  USER_ROLES.LAB_MANAGER,
  USER_ROLES.LAB_TECHNICIAN,
  USER_ROLES.LAB_QUALITY_CHECK,
]);

// General access middleware (all authenticated users)
export const generalAuth = roleBasedAuth(Object.values(USER_ROLES));

export default roleBasedAuth;
