import { Lookbook } from "../models/Lookbook.js";
import User from "../models/User.js";

// Create
export const createLookbook = async (data, userId) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");
 
  if(data.name  === undefined || data.name.trim() === "" || data.name===null) {
    throw new Error("Lookbook name is required");
  } 
    const lookbook = new Lookbook({ ...data, user: userId });
    return await lookbook.save();
 
};

// Get All for a user
export const getLookbooks = async (userId) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return await Lookbook.find({ user: userId })
    .populate("items")
    .populate("outfits");
};

// Get single
export const getLookbookById = async (id, userId) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return await Lookbook.findOne({ _id: id, user: userId })
    .populate("items")
    .populate("outfits");
};

// Update name/details
export const updateLookbook = async (id, data, userId) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return await Lookbook.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: data },
    { new: true }
  );
};

// Delete
export const deleteLookbook = async (id, userId) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return await Lookbook.findOneAndDelete({ _id: id, user: userId });
};

// Add items/outfits
export const addToLookbook = async (id, data, userId) => {

    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return await Lookbook.findOneAndUpdate(
    { _id: id, user: userId },
    { $addToSet: { items: { $each: data.items || [] }, outfits: { $each: data.outfits || [] } } },
    { new: true }
  ).populate("items").populate("outfits");
};



export const removeFromLookbookService = async (lookbookId, idsToRemove) => {
  // Find the lookbook first
  
  const lookbook = await Lookbook.findById(lookbookId);
  if (!lookbook) throw new Error("Lookbook not found");

  // Determine whether it's items or outfits
  let type = null;
  if (lookbook.items && lookbook.items.length > 0) type = "items";
  else if (lookbook.outfits && lookbook.outfits.length > 0) type = "outfits";
  else throw new Error("Lookbook has no items or outfits");

  // Remove the specified ids
  lookbook[type] = lookbook[type].filter(id => !idsToRemove.includes(id.toString()));

  // If empty after removal, delete the lookbook
  if (lookbook[type].length === 0) {
    await Lookbook.findByIdAndDelete(lookbookId);
    return { message: `All ${type} removed. Lookbook deleted.` };
  }

  await lookbook.save();
  return lookbook;
};
