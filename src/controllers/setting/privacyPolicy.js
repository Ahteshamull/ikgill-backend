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
    const privacyPolicy = await PrivacyPolicy.findOneAndUpdate({
      description,
      image: images,
    },
    { new: true, upsert: true }
    );
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

