import {
  createNotificationService,
  getAllNotificationsService,
  editNotificationService,
  deleteNotificationService,
  getNotificationByIdService
} from "../services/AffiliateData.service.js";

export const createAffiliateData = async (req, res) => {
  try {

// const data =JSON.parse(req.body.data);
const userId = req.headers.user_id;
    const data=req.body;
    console.log(data,"from 9th")
     
   if(data.title==="" || data.title===undefined||data.title===null){
      return res.status(400).json({ message: "Title is required" });
    }
    if(data.description==="" || data.description===undefined||data.description===null){
      return res.status(400).json({ message: "Description is required" });
    }
    if(data.link==="" || data.link===undefined||data.link===null){
      return res.status(400).json({ message: "Link is required" });
    }
if (req.file) {
  data.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}

    const result = await createNotificationService(userId,data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAffiliateData = async (req, res) => {
  try {
    const notifications = await getAllNotificationsService();
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editAffiliateData = async (req, res) => {
  try {
    const { id } = req.params;
    // const data =JSON.parse(req.body.data);
    const data=req.body;
    console.log(data,"from 9th")
     
    
if (req.file) {
  data.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}

    const notification = await editNotificationService(id, data);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAffiliateData = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteNotificationService(id);
    if (!result) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};






export const getAffiliatedDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await getNotificationByIdService(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};