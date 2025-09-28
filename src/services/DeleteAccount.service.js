import User from "../models/User.js";
import Planner from "../models/Planner.js";
import Outfit from "../models/Outfit.js";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";
import Wishlist from "../models/Wishlist.js";
import { createAdminNotification } from "./AdminNotification.services.js";

export const deleteAccountService = async (userId) => {
  // Delete all notifications of the user
  await Notification.deleteMany({ user: userId });

  // Delete all planner entries of the user
  await Planner.deleteMany({ user: userId });

  // Delete all outfits of the user
  await Outfit.deleteMany({ user: userId });

  // Delete all items of the user
  await Item.deleteMany({ user: userId });

  // Delete all wishlists of the user
  await Wishlist.deleteMany({ user: userId });

  // Finally, delete the user
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) throw new Error("User not found or already deleted");

  return deletedUser;
};
export const requestDeleteAccount = async (userId) => {
  const deleteAccount= await User.findByIdAndUpdate(
    userId,
    { disabled: true},
    { new: true }
  );
  await createAdminNotification({
      userId,
      deleteId: userId
    });
  return deleteAccount

};
export const AllDeleteAccountList=async()=>{
  return await User.find({disabled:true}).select( " _id username email")
}