import {
  createPlanner,
  getPlannerById,
  updatePlannerTime,
  getAllPlanners,
  deletePlanner,
} from "../services/Planner.service.js";

// ➕ Create planner
export const createPlannerController = async (req, res) => {
  try {
    const { outfitId, date, time } = req.body; // Accept date & time separately
    const userId = req.headers.user_id; // from auth middleware
console.log("Creating planner with:", { outfitId, date, time, userId });
    const planner = await createPlanner(outfitId, date, time, userId);
    res.status(201).json(planner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📖 Get all planners for a user
export const getAllPlannersController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const planners = await getAllPlanners(userId);
    res.status(200).json(planners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get single planner by ID
export const getPlannerByIdController = async (req, res) => {
  try {
    const plannerId = req.params.id;
    const planner = await getPlannerById(plannerId);

    if (!planner) {
      return res.status(404).json({ message: "Planner not found" });
    }
    res.status(200).json(planner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⏰ Update planner date and time
export const updatePlannerTimeController = async (req, res) => {
  try {
    const plannerId = req.params.id;
    const { date, time } = req.body; // Accept date & time separately
    const userId = req.headers.user_id;

    const planner = await updatePlannerTime(plannerId, userId, date, time);
    if (!planner) {
      return res.status(404).json({ message: "Planner not found or not yours" });
    }

    res.status(200).json(planner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Delete planner
export const deletePlannerController = async (req, res) => {
  try {
    const plannerId = req.params.id;
    const userId = req.headers.user_id;

    const deleted = await deletePlanner(plannerId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Planner not found or not yours" });
    }

    res.status(200).json({ message: "Planner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
