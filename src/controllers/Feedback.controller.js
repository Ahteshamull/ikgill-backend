import {
  createFeedback,
  getAllFeedback,
  getUserFeedback,
  deleteFeedback,
} from "../services/Feedback.service.js";

// ➕ Create feedback
export const createFeedbackController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const feedback = await createFeedback(userId, req.body);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📖 Get all feedback (admin)
export const getAllFeedbackController = async (req, res) => {
  try {
    const feedbacks = await getAllFeedback();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get user feedback
export const getUserFeedbackController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const feedbacks = await getUserFeedback(userId);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Delete feedback
export const deleteFeedbackController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const feedbackId  = req.params.id;

    const deleted = await deleteFeedback(feedbackId, userId);
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
