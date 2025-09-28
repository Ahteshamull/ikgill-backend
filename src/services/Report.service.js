import Report from "../models/Report.js";
import Community from "../models/Community.js";
import Outfit from "../models/Outfit.js"; 
import User from "../models/User.js";
import { createAdminNotification } from "./AdminNotification.services.js";


import mongoose from "mongoose";

export const createReportService = async ({ reporterId, targetUserId, targetCommunity, reason, reportType }) => {
  console.log(reporterId,targetUserId,targetCommunity,reason,reportType)

  if (!["Profile", "Post"].includes(reportType)) {
    throw new Error("Invalid report type");
  }

  if (reportType === "Post") {
    if (!targetCommunity) throw new Error("targetCommunity required for post report");

    // fetch the Community post to get its owner
    const community = await Community.findById(targetCommunity)
    
    if (!community) throw new Error("Community post not found");

    const report= await Report.create({
      reporter: reporterId,
      targetUser:  community.user, 
      targetCommunity: targetCommunity,
      reason,
      reportType,
    });
    community.reports.push({ user: reporterId, message: reason });
    await community.save();
    await createAdminNotification({
      userId: reporterId,
      ReportId: report._id
    });
    return report 
  }

  if (reportType === "Profile") {
    if (!targetUserId) throw new Error("targetUserId required for user report");

    const report= await Report.create({
      reporter: reporterId,
      targetUser: targetUserId,
      reason,
      reportType,
    });
    await createAdminNotification({
      userId: reporterId,
      ReportId: report._id
    });
    return report
  }
};



export const getAllReportsService = async () => {
  // Fetch all reports sorted by newest first
  const reports = await Report.find()
    .populate("reporter", "username email profileImage") // who reported
    .populate("targetUser", "username email profileImage") // if type user
    .populate({
      path: "targetCommunity",
      populate: { path: "post", select: "title image user", populate: { path: "user", select: "username email profileImage" } }
    }) // if type post
    .sort({ createdAt: -1 })
    .select("reportType reason targetUser targetCommunity reporter status createdAt");  

  return reports;
};


// 1️⃣ Delete report by ID
export const deleteReportByIdService = async (reportId) => {
  console.log("ldk",reportId,"kkdk")
  const report = await Report.findById(reportId);
  console.log(report)
  if (!report) throw new Error("Report not found");
  console.log("dkkd")
  if (report.reportType === "Post" && report.targetCommunity) {
  const community = await Community.findById(report.targetCommunity);
  if (community.active === false && report.reportType === "Post"  ) {
    await Community.findByIdAndDelete(community._id);
  }
}
console.log("dkkd1")

  await Report.findByIdAndDelete(reportId);
    
}

export const deleteReportWithcommunityByIdService = async (reportId) => {
  const report = await Report.findById(reportId);
  if (!report) throw new Error("Report not found");

  if (report.reportType === "Post" && report.targetCommunity) {
    // Delete the community post
    const community = await Community.findById(report.targetCommunity);
    if (community) {
      await Community.findByIdAndDelete(community._id); // delete community reference
    }
  }
  // Delete the report itself
  await Report.findByIdAndDelete(reportId);

  return { message: "Report and related post (if any) deleted successfully" };
};

export const bannnedPostService = async (reportId) => {

  const report = await Report.findById(reportId);
  const community = await Community.findById(report.targetCommunity);
  console.log("dl",community)
 
  
  if (!community) throw new Error("Community post not found");   
  console.log(community.active)
    if (community) {
      if(community.active === false){
        community.active = true;
      }
      else
        community.active = false;

      await community.save();
      report.status="Resolved"
      await report.save(); 
    }

}




// 2️⃣ Toggle report status
export const toggleReportStatusService = async (reportId) => {
  const report = await Report.findById(reportId);
  if (!report) throw new Error("Report not found");

  // Toggle between "pending" and "banned"
  if (report.status === "Resolved") {
    report.status = "Pending";
  }
  else if (report.status === "Pending") {
    report.status = "Resolved";
  }
  else{
    report.status = "Resolved";

  }
  
  await report.save();
 
  // If banned and post type, deactivate related post
  // else if (report.status === "Banned" && report.reportType === "Post" && report.targetCommunity) {
  //   const community = await Community.findById(report.targetCommunity);
  //   if (community) {
  //     community.active = false; // deactivate post
  //     await community.save();

  //   }
  // }


  console.log(report.targetUser.toString())
  if(report.status==="Resolved" && report.reportType==="Profile" ){
    await User.findByIdAndUpdate({_id:report.targetUser.toString()}, { disabled:true }); 
  }

  return report;
};



// Dynamic search service
export const searchReportsService = async (filters) => {
  const { username, reportType, status } = filters;

  // Build query dynamically
  const query = {};
console.log(reportType)
  if (reportType) query.reportType = reportType; // filter by "post" or "user"
  if (status) query.status = status;             // filter by "pending" or "banned"

  // If username provided, find user IDs for reporter or target
  if (username) {
    const users = await User.find({ username: { $regex: username, $options: "i" } });
    const userIds = users.map(u => u._id);

    query.$or = [
      { reporter: { $in: userIds } },
      { targetUser: { $in: userIds } }
    ];
  }

  // Fetch reports with populates
  const reports = await Report.find(query)
    .populate("reporter", "username email profileImage")
    .populate("targetUser", "username email profileImage")
    .populate({
      path: "targetCommunity",
      populate: {
        path: "post",
        select: "title image user",
        populate: { path: "user", select: "username email profileImage" }
      }
    })
    .sort({ createdAt: -1 }) // newest first
    .select("reportType reason status targetUser targetCommunity reporter createdAt");

  return reports;
};






export const getReportDetailsByIdService = async (reportId) => {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new Error("Invalid reportId");
  }
console.log(new mongoose.Types.ObjectId(reportId))
 const reportss = await Report.findById(reportId)
    .populate("reporter", "name username email") // populate only required fields
    .lean(); 

console.log(reportss);
 

  

  // Step 2: Handle based on type
  if (reportss.reportType === "Post") {
 // Step 1: Find the report inside Community.reports
  const community = await Community.findOne({_id: reportss.targetCommunity }
);

  console.log(community)
  if (!community) {
    throw new Error("Report not found");
  }
 



    const outfit = await Outfit.findById(community.post).select("title image createdAt");
     const user = await User.findById(reportss.targetUser).select(
      "username name email phone profileImage bio gender dob location createdAt"
    );
    return {
      reportUser:user,
      reportedBy: reportss.reporter,
      reportType: "Post",
      reportedAt: reportss.reportedAt,
      reason: reportss.reason,
      status: reportss.status,
      PostStatus: community.active,
      outfit: outfit
        ? {
            title: outfit.title,
            image: outfit.image,
            createdAt: outfit.createdAt,
          }
        : null,
    };
  }

  if (reportss.reportType === "Profile") {
    const user = await User.findById(reportss.targetUser).select(
      "username name email phone profileImage bio gender dob location createdAt"
    );
    return {
      reportUserId: reportss.targetUser,
      reportedBy: reportss.reporter,
      reportType: "Profile",
      reportedAt: reportss.reportedAt,
      reason: reportss.message,
      status: reportss.status,
      user,
    };
  }

  return null;
}
