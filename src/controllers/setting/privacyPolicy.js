import PrivacyPolicy from "../../models/setting/privacyPolicy.js";
export const createPrivacyPolicy = async (req, res) => {
  try {
    const { description } = req.body;
    const images = req.files?.map(
      (item) => `${process.env.IMAGE_URL}${item.filename}`
    );
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }
    const privacyPolicy = await PrivacyPolicy.create({
      description,
      image: images,
    });
    res.status(201).json(privacyPolicy);
  } catch (error) {
    res.status(500).json({ error: "Failed to create privacy policy" });
  }
};

export const getPrivacyPolicy = async (req, res) => {
    try {
    const privacyPolicy = await PrivacyPolicy.findOne();
    res.status(200).json(privacyPolicy);
  } catch (error) {
    res.status(500).json({ error: "Failed to get privacy policy" });
  }
};

export const updatePrivacyPolicy = async (req, res) => {
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

    const privacyPolicy = await PrivacyPolicy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!privacyPolicy) {
      return res.status(404).json({ message: "Privacy Policy not found" });
    }

    res
      .status(200)
      .json({ message: "Privacy Policy updated successfully", privacyPolicy });
  } catch (error) {
    res.status(500).json({ message: "Failed to update privacy policy" });
  }
};
