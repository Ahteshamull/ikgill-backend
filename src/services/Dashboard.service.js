import User from "../models/User.js";
import Outfit from "../models/Outfit.js";
import Community from "../models/Community.js";
import Feedback from "../models/Feedback.js";
import AffiliateData from "../models/AffiliateData.js";
import Report from "../models/Report.js";

export const getTotalUsers = async () => {
  return await User.countDocuments();
};

export const getActiveUsers = async () => {
  return await User.countDocuments({ active: true });
};

export const getDailyUploadedOutfits = async (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return await Outfit.countDocuments({ createdAt: { $gte: start, $lte: end } });
};

export const getTotalFeedbacks = async () => {
  return await Feedback.countDocuments();
};
export const getTotalAffiliateData = async () => {
  return await AffiliateData.countDocuments();
};

export const countDisabledUsers = async () => {
  return await User.countDocuments({ disabled: true });
};
export const countReports = async () => {
  return await Report.countDocuments();
};


export const countAllReports = async () => {
  // count profile reports in user schema
  const profileReports = await User.aggregate([
    { $unwind: "$reports" },
    { $count: "totalProfileReports" }
  ]);

  // count post reports in community schema
  const postReports = await Community.aggregate([
    { $unwind: "$reports" },
    { $count: "totalPostReports" }
  ]);

  return {
    profileReports: profileReports.length ? profileReports[0].totalProfileReports : 0,
    postReports: postReports.length ? postReports[0].totalPostReports : 0,
    totalReports:
      (profileReports.length ? profileReports[0].totalProfileReports : 0) +
      (postReports.length ? postReports[0].totalPostReports : 0)
  };
}



export const getReportsWithPost = async () => {
  return await Community.aggregate([
    { $unwind: "$reports" },
    {
      $project: {
        reportId: "$reports._id",
        post: 1,
        user: "$reports.user",
        message: "$reports.message",
        reportedAt: "$reports.reportedAt",
      },
    },
  ]);
};

// ✅ Get only report IDs
export const getReportsIdsOnly = async () => {
  return await Community.aggregate([
    { $unwind: "$reports" },
    { $project: { reportId: "$reports._id" } },
  ]);
};



export const getUserActivityStats = async (period = "monthly") => {
  let unit;

  switch (period) {
    case "weekly":
      unit = "week";
      break;
    case "monthly":
      unit = "month";
      break;
    case "yearly":
      unit = "year";
      break;
    default:
      unit = "month";
  }

  const result = await User.aggregate([
    // expand loginHistory, but keep empty if needed
    { $unwind: { path: "$loginHistory", preserveNullAndEmptyArrays: true } },

    // add truncated dates
    {
      $addFields: {
        firstLoginPeriod: {
          $cond: [
            { $ifNull: ["$firstLogin", false] },
            { $dateTrunc: { date: "$firstLogin", unit: unit } },
            null
          ]
        },
        loginPeriod: {
          $cond: [
            { $ifNull: ["$loginHistory.loginAt", false] },
            { $dateTrunc: { date: "$loginHistory.loginAt", unit: unit } },
            null
          ]
        }
      }
    },

    {
      $facet: {
        newUsers: [
          { $match: { firstLoginPeriod: { $ne: null } } },
          {
            $group: {
              _id: "$firstLoginPeriod",
              users: { $addToSet: "$_id" }
            }
          },
          { $project: { _id: 1, count: { $size: "$users" } } },
          { $sort: { _id: 1 } }
        ],

        oldUsers: [
          {
            $match: {
              loginPeriod: { $ne: null },
              $expr: { $gt: ["$loginHistory.loginAt", "$firstLogin"] }
            }
          },
          {
            $group: {
              _id: "$loginPeriod",
              users: { $addToSet: "$_id" }
            }
          },
          { $project: { _id: 1, count: { $size: "$users" } } },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  return {
    newUsers: result[0].newUsers,
    oldUsers: result[0].oldUsers
  };
};






