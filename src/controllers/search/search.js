import { searchHandler } from "../../middlewares/searchHandler.js";
import mongoose from "mongoose";

// Search users
export const searchUser = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const results = await searchHandler("UserRole", q, [
      "name",
      "email",
      "phone",
      "role",
    ]);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Search products
export const searchProduct = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const results = await searchHandler("Product", q, [
      "name",
      "productType",
      "productTier",
    ]);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Search cases
export const searchCase = async (req, res) => {
  try {
    const { q, id, patientID } = req.query;

    // If id is provided and is a valid ObjectId, return that single case
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid id format",
        });
      }
      const doc = await mongoose.model("Case").findById(id);
      return res.json({ success: true, count: doc ? 1 : 0, data: doc ? [doc] : [] });
    }

    // Search by patientID if provided (partial match, case-insensitive)
    if (patientID) {
      const results = await mongoose
        .model("Case")
        .find({ patientID: { $regex: patientID, $options: "i" } })
        .limit(20);
      return res.json({ success: true, count: results.length, data: results });
    }

    // Fallback to query-based search
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const results = await searchHandler("Case", q, [
      "caseNumber",
      "patientID",
      "scanNumber",
    ]);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Search clinics
export const searchClinic = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const results = await searchHandler("Clinic", q, ["name", "email"]);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Search labs
export const searchLab = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const results = await searchHandler("Lab", q, ["name", "email"]);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
