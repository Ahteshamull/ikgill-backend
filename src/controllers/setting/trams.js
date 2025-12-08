import Trams from "../../models/setting/trams.js";
export const createTrams = async (req, res) => {
  try {
    const { description } = req.body;
    const images = req.files?.map(
      (item) => `${process.env.IMAGE_URL}${item.filename}`
    );
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }
    const trams = await Trams.findOneAndUpdate(
      {}, // Find any existing document (empty query)
      { description, image: images }, // Update data
      { new: true, upsert: true }
    );
    res.status(201).json({
      message: "Trams Posted successfully",
      success: true,
      data: trams,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create trams" });
  }
};

export const getTrams = async (req, res) => {
  try {
    const trams = await Trams.findOne();
    res.status(200).json(trams);
  } catch (error) {
    res.status(500).json({ error: "Failed to get trams" });
  }
};
