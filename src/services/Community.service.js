import Community from "../models/Community.js";
import outfit from "../models/Outfit.js"
import User from "../models/User.js"
export const getAllPostsService = async () => {
  const communities = await Community.find({ active: true }) // ✅ active communities only
    .populate({
      path: "user",
      match: { disabled: false }, // ✅ only users with active:false (deactivated)
    })
    .populate({
      path: "post",
      model: "Outfit",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .populate("reactions.user")
    .lean();

  // remove communities where `user` got filtered out by match
  return communities.filter(c => c.user);
};



export const reactToPost = async (postId, userId, reactionType) => {
   
  // Ensure post exists
  const user= await User.findById({_id:userId})
  if(!user) throw new Error("User not found")
  if(user.disabled) throw new Error("Account  has disabled")
  const post = await outfit.findById({_id:postId});
  if (!post) throw new Error("Post not found");

  // Find or create PostSocial for this post
  let postSocial = await Community.findOne({ post: postId });
  if (!postSocial) {
    postSocial = new Community({ post: postId, reactions: [], reports: [] });
  }

  // Check if user already reacted
  const existingReactionIndex = postSocial.reactions.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingReactionIndex !== -1) {
    // Update reaction type if already reacted
    postSocial.reactions[existingReactionIndex].type = reactionType;
    postSocial.reactions[existingReactionIndex].reactedAt = new Date();
  } else {
    // Add new reaction
    postSocial.reactions.push({ user: userId, type: reactionType });
  }

  await postSocial.save();
  return postSocial;
// const result = await Community.create(postSocial)
// return result
};



export const reportPost = async (postId, userId, message) => {

  
  const user= await User.findById({_id:userId})
  if(!user) throw new Error("User not found")
  if(user.disabled) throw new Error("Account  has disabled")


  let postSocial = await Community.findOne({ post: postId });
  if (!postSocial) {
    postSocial = new Community({ post: postId });
  }

  // prevent duplicate report by same user
  const alreadyReported = postSocial.reports.some(r => r.user.toString() === userId);
  if (alreadyReported) throw new Error("User already reported this post");

  postSocial.reports.push({ user: userId, message });
  await postSocial.save();
  return postSocial;
};

