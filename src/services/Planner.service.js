import Outfit from "../models/Outfit.js";
import Planner from "../models/Planner.js";
import User from "../models/User.js";
import { schedulePlannerNotification } from "../utils/SchedulePlanner.js";

export const createPlanner = async (outfitId, date, time, userId) => {
    const user1 = await User.findById({ _id: userId });
    if (!user1) throw new Error("User not found");
    if (user1.disabled) throw new Error("Account has disabled");
  const timeAmPm = time; // convert time to AM/PM

  // Check duplicate
  const exists = await Planner.findOne({ user: userId, outfit: outfitId, date, time: timeAmPm });
  if (exists) throw new Error("Planner with same outfit, date, and time already exists.");

  const planner = new Planner({ user: userId, outfit: outfitId, date, time: timeAmPm });
  schedulePlannerNotification(planner);


  const savedPlanner = await planner.save();

 await Outfit.findOneAndUpdate(
      { _id: outfitId, user: userId },
      { 
        $inc: { count: 1 } 
      },
      { new: true, runValidators: true }
    )


  return await Planner.findById(savedPlanner._id)
    .populate("user", "name profileImage")
    .populate({
      path: "outfit",
      select: "title image style",
      populate: { path: "style", select: "name" },
    });
};

export const updatePlannerTime = async (plannerId, userId, newDate, newTime) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  const timeAmPm = newTime;

  const planner = await Planner.findOneAndUpdate(
    { _id: plannerId, user: userId },
    { date: newDate, time: timeAmPm },
    { new: true }
  )
    .populate("user", "name profileImage")
    .populate({
      path: "outfit",
      select: "title image style",
      populate: { path: "style", select: "name" },
    });

  // Optional: reschedule notification
  if (planner) schedulePlannerNotification(planner);

  return planner;
};


export const getAllPlanners = async (userId) => {

    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");

  return await Planner.find({ user: userId })
    .populate("outfit", "title image style")
    .populate({
      path: "outfit",
      populate: { path: "style", select: "name" }, // populate style names
    });
};

export const getPlannerById = async (plannerId) => {
  return await Planner.findById(plannerId)
    .populate("user", "name profileImage")
    .populate({
      path: "outfit",
      select: "title image style",
      populate: { path: "style", select: "name" },
    });
};

// export const updatePlannerTime = async (plannerId, userId, newDate, newTime) => {
//   const planner = await Planner.findOneAndUpdate(
//     { _id: plannerId, user: userId },
//     { date: newDate, time: newTime },
//     { new: true }
//   )
//     .populate("user", "name profileImage")
//     .populate({
//       path: "outfit",
//       select: "title image style",
//       populate: { path: "style", select: "name" },
//     });

//   return planner;
// };

export const deletePlanner = async (plannerId, userId) => {
    const user1 = await User.findById({ _id: userId });
  if (!user1) throw new Error("User not found");
  if (user1.disabled) throw new Error("Account has disabled");
  
  return await Planner.findOneAndDelete({
    _id: plannerId,
    user: userId,
  });
};
