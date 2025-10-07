import Admin from "../../models/admin/adminModal.js";
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const images = req.files?.map(
      (item) => `${process.env.IMAGE_URL}${item.filename}`
    );
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
      if (email) {
          const admin = await Admin.findOne({ email });
          if (admin) {
              return res.status(400).json({ error: "Admin already exists" });
          }
      }
    const admin = await Admin.create({ name, email, password, image: images });
    res.status(201).json(admin);
  } catch (error) {
    
    res.status(500).json({ error: "Failed to create admin" });
  }
};

export const getAllAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalAdmins = await Admin.countDocuments();
        const admin = await Admin.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalPages = Math.ceil(totalAdmins / limit);

        res.status(200).json({
            success: true,
            message: "Admins fetched successfully",
            data: admin,
            pagination: {
                currentPage: page,
                totalPages,
               
                limit,
             
            },
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: "Failed to get admin" 
        });
    }
};

export const getSingleAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: "Failed to get admin" });
    }
};

export const deleteAdmin    = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Admin deleted successfully",admin});
    } catch (error) {
        res.status(500).json({message:"Failed to delete admin" });
    }
};
    