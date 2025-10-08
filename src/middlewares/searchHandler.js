import mongoose from "mongoose";

export const searchHandler = async (modelName, searchTerm, fields = []) => {
  const Model = mongoose.model(modelName);

  if (!Model) throw new Error(`Model ${modelName} not found`);

  // Build a flexible search query
  const searchQuery = {
    $or: fields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    })),
  };

  const results = await Model.find(searchQuery).limit(20);
  return results;
};
