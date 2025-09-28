import User from "../models/User.js";


export const followUser = async (userId, targetUserId) => {




  if (userId === targetUserId) throw new Error("You cannot follow yourself");

  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");
  
  if(user.disabled) throw new Error("Account  has disabled")

  const isFollowing = user.following.includes(targetUserId);

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(
      userId,
      { $pull: { following: targetUserId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $pull: { followers: userId } },
      { new: true }
    );

    return { message: "Unfollowed successfully" };
  } else {
    // Follow
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { following: targetUserId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      targetUserId,
      { $addToSet: { followers: userId } },
      { new: true }
    );

    return { message: "Followed successfully" };
  }
};



export const unfollowUser = async (userId, targetUserId) => {
  await User.findByIdAndUpdate(
    userId,
    { $pull: { following: targetUserId } },
    { new: true }
  );

  await User.findByIdAndUpdate(
    targetUserId,
    { $pull: { followers: userId } },
    { new: true }
  );

  return { message: "Unfollowed successfully" };
};
