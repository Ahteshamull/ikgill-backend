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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalLabs = await labModel.countDocuments();
        const lab = await labModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalLabs / limit);

        return res.status(200).json({
            success: true,
            message: "Lab fetched successfully",
            data: lab,
            pagination: {
                currentPage: page,
                totalPages,
                limit,
            },
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
export const changeLabStatus = async (req, res) => {
    try {
        const lab = await labModel.findByIdAndUpdate(
            req.params.id,
         {
            labStatus: req.body.labStatus,
         },
         { new: true }
        );
        return res.status(200).json({
            success: true,
            message: "Lab status changed successfully",
            
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lab status changing failed",
            error: error.message,
        });
    }

};