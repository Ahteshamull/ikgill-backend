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
    const aboutUs = await AboutUs.create({
      description,
      image: images,
    });
    res.status(201).json(aboutUs);
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

export const updateAboutUs = async (req, res) => {
  try {
    const { description } = req.body;
    const updateData = {};

    if (description) {
      updateData.description = description;
    }

    if (req.files && req.files.length > 0) {
      const images = req.files.map(
        (item) => `${process.env.IMAGE_URL}${item.filename}`
      );
      updateData.image = images;
    }

    const aboutUs = await AboutUs.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!aboutUs) {
      return res.status(404).json({ message: "About Us not found" });
    }

    res
      .status(200)
      .json({ message: "About Us updated successfully", aboutUs });
  } catch (error) {
    res.status(500).json({ message: "Failed to update about us" });
  }
};
