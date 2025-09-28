import {
  createStyleService,
  updateStyleService,
  deleteStyleService,
  getAllStylesService,
  countStyleUsageService
} from "../services/Style.service.js";

// Create Style
export const createStyleController = async (req, res) => {
  try {
   

    const style = await createStyleService(req.body, req.headers.user_id);
    res.status(201).json({ success: true, style });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Style
export const updateStyleController = async (req, res) => {
  try {
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Only admins can edit styles" });
    // }

    const style = await updateStyleService(req.params.id, req.body);
    if (!style) {
      return res.status(404).json({ success: false, message: "Style not found" });
    }
    res.status(200).json({ success: true, style });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Style
export const deleteStyleController = async (req, res) => {
  try {
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Only admins can delete styles" });
    // }

    const style = await deleteStyleService(req.params.id);
    if (!style) {
      return res.status(404).json({ success: false, message: "Style not found" });
    }
    res.status(200).json({ success: true, message: "Style deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Styles (Users + Admin)
export const getAllStylesController = async (req, res) => {
  try {
    const styles = await getAllStylesService();
    res.status(200).json({ success: true, styles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const countStyleUsageController = async (req, res) => {
  try {
    const usage = await countStyleUsageService();
    res.status(200).json({ success: true, styleUsage: usage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};