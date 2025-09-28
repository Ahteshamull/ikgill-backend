import * as StatsService from "../services/Dashboard.service.js";

export const getAllStats = async (req, res) => {
  try {
    const totalUsers = await StatsService.getTotalUsers();
    const activeUsers = await StatsService.getActiveUsers();
    const dailyOutfits = await StatsService.getDailyUploadedOutfits();
    const feedbackCount = await StatsService.getTotalFeedbacks();
    const DataComplianceCount = await StatsService.countDisabledUsers();
    const ReportCount = await StatsService.countReports();
     const getAllReportsCount = await StatsService.countAllReports();
    
    const reportsWithPost = await StatsService.getReportsWithPost();
    const reportIdsOnly = await StatsService.getReportsIdsOnly();
    const AffiliateData = await StatsService.getTotalAffiliateData()
    // const yearlyUsers = await StatsService.getYearlyUserStats();
    // const yearlyLogins = await StatsService.getYearlyLoginStats();



    

    res.json({
      totalUsers,
      activeUsers,
      dailyOutfits,
      feedbackCount,
      AffiliateData,
      DataComplianceCount,
      getAllReportsCount,
        ReportCount ,
      reportsWithPost,
      reportIdsOnly,
      // yearlyUsers,
      // yearlyLogins
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getUserActivityController = async (req, res) => {
  try {
    const period  = req.params.keyword; // weekly | monthly | yearly
    if (!["weekly", "monthly", "yearly"].includes(period)) {
      return res.status(400).json({ message: "Invalid period. Use weekly, monthly, or yearly." });
    }

    const stats = await StatsService.getUserActivityStats(period);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
