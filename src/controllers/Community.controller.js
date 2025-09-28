import { getAllPostsService, reactToPost, reportPost } from "../services/Community.service.js";

export const reactPostController = async (req, res) => {
  try {
    
    const postSocial = await reactToPost(req.body.postId,req.headers.user_id, req.body.type);
    res.json(postSocial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const reportPostController = async (req, res) => {
  try {
    const postSocial = await reportPost(req.body.postId, req.headers.user_id, req.body.message);
    res.json(postSocial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllPostsController = async (req, res) => {
  try {
    const posts = await getAllPostsService();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};