import Outfit from "../models/Outfit.js";
import Style from "../models/Style.js";
import { sendNotificationToUser } from "../socket.js";
import Notification from "../models/Notification.js";


// Create Style (Admin only)
export const createStyleService = async (styleData, adminId) => {
  const style = await Style.create({ ...styleData, createdBy: adminId });
  const msg= `New Style created: ${style.name}`;
  const notification= await Notification.create({
      user: adminId,
      adminMessage: msg,
    });
  await sendNotificationToUser("admin", notification);
  return style;
};

// Edit Style (Admin only)
export const updateStyleService = async (styleId, updateData) => {
  const style = await Style.findByIdAndUpdate(styleId, updateData, {
    new: true,
    runValidators: true,
  });
  return style;
};

// Delete Style (Admin only)
export const deleteStyleService = async (styleId) => {
  const style = await Style.findByIdAndDelete(styleId);
  return style;
};

// Get All Styles (Users + Admin)
export const getAllStylesService = async () => {
  const styles = await Style.find().select("name createdAt");
  return styles;
};



export const countStyleUsageService = async () => {
   const counts = await Outfit.aggregate([
    { $unwind: "$style" }, // break array of style IDs into multiple docs
    { $group: { _id: "$style", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "styles", // collection name of Style model
        localField: "_id",
        foreignField: "_id",
        as: "styleDetails"
      }
    },
    { $unwind: "$styleDetails" },
    { $project: { _id: 0, styleId: "$_id", styleName: "$styleDetails.name", count: 1 } }
  ]);
  return counts
};