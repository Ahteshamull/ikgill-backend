import mongoose from "mongoose";
import Outfit from "../models/Outfit.js";
import Planner from "../models/Planner.js";
import Item from "../models/Item.js";








export const getWardropUsage = async ({userid}) => {
  const totalOutfit= await Outfit.countDocuments({user:userid});
  console.log("totalOutfit",totalOutfit)
  const totalPlanner= await Planner.countDocuments({user:userid});
  console.log("totalPlanner",totalPlanner)
  const usage= totalPlanner*100/(totalOutfit)

    return usage;
};



// Get top 5 outfits based on count
export const getTopOutfits = async (userid) => {
  try {
    const topOutfits = await Outfit.find({user:userid})
      .sort({ count: -1 })   // sort descending by count
      .limit(5)              // take top 5
      .populate("style","name")     // optional, if style is ref
      .populate("user", "name email"); // optional user info

    return topOutfits;
  } catch (error) {
    console.error(error);
    return error
  }
};






export const getUserColorsStats = async (userid) => {
  try {


    const result = await Item.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userid) } }, // filter user's outfits
      { $unwind: "$colors" }, // break arrays into individual colors
      {
        $group: {
          _id: "$colors",
          usageCount: { $sum: 1 } // count how many times each color is used
        }
      },
      { $sort: { usageCount: -1 } } // sort by most used color
    ]);

    return {
      totalUniqueColors: result.length,
      colors: result.map(r => r._id),
      details: result
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};
