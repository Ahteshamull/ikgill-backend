import { createReportService, deleteReportByIdService, getAllReportsService, searchReportsService, toggleReportStatusService,getReportDetailsByIdService, deleteReportWithcommunityByIdService, bannnedPostService } from "../services/Report.service.js";

export const createReportController = async (req, res) => {
  try {
    console.log(req.body,"ghg")
    const {   reason, reportType } = req.body;
    console.log(req.body,"kd")
    const reporterId = req.headers.user_id;
    const temp= null;
    if(reportType==="Post"){
      const {targetCommunity} = req.body
      const report = await createReportService({
      reporterId,
      temp,
      targetCommunity,
      reason,
      reportType,
    });
    res.status(201).json({ message: "Report submitted successfully", report });
      
    }
    else{

       const targetUserId = req.body.targetUser
      //  console.log(targetUser)
        const report = await createReportService({
      reporterId,

      targetUserId,
      temp,
      reason,
      reportType,
    });
    res.status(201).json({ message: "Report submitted successfully", report });
      
    }
    
    // const report = await createReportService({
    //   reporterId,
    //   targetUserId,
    //   targetCommunityId,
    //   reason,
    //   reportType,
    // });
// console.log(report)
//     res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllReportsController = async (req, res) => {
  try {
    const reports = await getAllReportsService();
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const deleteReportByIdController = async (req, res) => {
  try {
    const { reportId } = req.body;
    console.log(reportId)
    const result = await deleteReportByIdService(reportId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteReportwithCommunityByIdController = async (req, res) => {
  try {
    const { reportId } = req.body;
    const result = await deleteReportWithcommunityByIdService(reportId);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const toggleReportStatusController = async (req, res) => {
  try {
    const { reportId } = req.body;
    const updatedReport = await toggleReportStatusService(reportId);
    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const BannedStatusController = async (req, res) => {
  try {
    const { reportId } = req.body;
    const updatedReport = await bannnedPostService(reportId);
    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const searchReportsController = async (req, res) => {
  try {
    const { username, reportType, status } = req.body;

    const filters = { username, reportType, status };
    const reports = await searchReportsService(filters);

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




export const getReportDetailsByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportDetailsByIdService(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
