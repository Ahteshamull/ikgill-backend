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
    const trams = await Trams.create({
      description,
      image: images,
    });
    res.status(201).json(trams);
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

export const updateTrams = async (req, res) => {
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

    const      trams = await Trams.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!trams) {
      return res.status(404).json({ message: "Trams not found" });
    }

    res
      .status(200)
      .json({ message: "Trams updated successfully", trams });
  } catch (error) {
    res.status(500).json({ message: "Failed to update trams" });
  }
};
