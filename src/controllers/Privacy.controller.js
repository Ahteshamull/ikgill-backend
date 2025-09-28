import { getPrivacyService, updatePrivacyService } from "../services/Privacy.service.js";

export const updatePrivacyController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const privacyData = req.body; // e.g., { items: "only_me" }

    const updatedPrivacy = await updatePrivacyService(userId, privacyData);

    res.status(200).json({
      success: true,
      message: "Privacy updated successfully",
      privacy: updatedPrivacy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrivacyController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    console.log(userId)
    const privacy = await getPrivacyService(userId);

    res.status(200).json({ success: true, privacy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};