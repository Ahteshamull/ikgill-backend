import labModel from "../../models/lab/lab.js";

export const createLab = async (req, res) => {
    try {
        const { name, email, details } = req.body;
        const lab = await labModel.create({
            name,
            email,
            details,
        });
        return res.status(201).json({
            success: true,
            message: "Lab created successfully",
            data: lab,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lab creation failed",
            error: error.message,
        });
    }
};
export const getLab = async (req, res) => {
    try {
        const lab = await labModel.find();
        return res.status(200).json({
            success: true,
            message: "Lab fetched successfully",
            data: lab,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lab fetching failed",
            error: error.message,
        });
    }
};
export const updateLab = async (req, res) => {
    try {
        const { name, email, details } = req.body;
        const lab = await labModel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                details,
            },
            { new: true }
        );
        return res.status(200).json({
            success: true,
            message: "Lab updated successfully",
            data: lab,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lab updating failed",
            error: error.message,
        });
    }
};
export const deleteLab = async (req, res) => {
    try {
        const lab = await labModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Lab deleted successfully",
            data: lab,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lab deleting failed",
            error: error.message,
        });
    }
};
export const singleLabById = async (req, res) => {
    try {
        const lab = await labModel.findById(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Lab fetched successfully",
            data: lab,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lab fetching failed",
            error: error.message,
        });
    }
};
    