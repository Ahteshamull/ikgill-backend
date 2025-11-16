import AboutUs from "../../models/setting/aboutUs.js";
export const createAboutUs = async (req, res) => {
  try {
    const { description } = req.body;
    const images = req.files?.map(
      (item) => `${process.env.IMAGE_URL}${item.filename}`
    );
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }
    const aboutUs = await AboutUs.findOneAndUpdate(
      {},
      {
        description,
        image: images,
      },
      { new: true, upsert: true }
    );
    res
      .status(201)
      .json({
        message: "About Us Posted successfully",
        success: true,
        data: aboutUs,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to create about us" });
  }
};

export const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne();
    res.status(200).json(aboutUs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get about us" });
  }
};
