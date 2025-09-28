
import { createMetarialsService, deleteMetarialsService, getAllMetarialsService, updateMetarialsService } from "../services/Metarials.service.js";

// Create Style
export const creatMetarialsController = async (req, res) => {
  try {
   

    const style = await createMetarialsService(req.body, req.headers.user_id);
    res.status(201).json({ success: true, style });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Style
export const updateMetarialsController = async (req, res) => {
  try {
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Only admins can edit styles" });
    // }

    const Metarials = await updateMetarialsService(req.params.id, req.body);
    if (!Metarials) {
      return res.status(404).json({ success: false, message: "Metarials not found" });
    }console.log("Metarials")
    res.status(200).json({ success: true,Metarials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Style
export const deletMetarialsController = async (req, res) => {
  try {
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: "Only admins can delete styles" });
    // }

    const style = await deleteMetarialsService(req.params.id);
    if (!style) {
      return res.status(404).json({ success: false, message: "Style not found" });
    }
    res.status(200).json({ success: true, message: "Style deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllMetarialController = async (req, res) => {
  try {
    const Metarial = await getAllMetarialsService();
    res.status(200).json({ success: true, Metarial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};