import * as profileService from "../services/profile.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService. getUserProfile(req.headers.user_id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    console.log("hello")
    const userId = req.headers.user_id;

    const updateData = req.body; 
    console.log(updateData)
    // Assuming the update data is in the request body
    if(req.file){

      let imageUrl = null;
if (req.file) {
  imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}

        const updatedProfile = await profileService.updateProfile(userId, req.body,imageUrl);
      res.json(updatedProfile);
    }
    
    
  
    else{
      const updatedProfile = await profileService.updateProfile(userId, req.body);
    res.json(updatedProfile);
    }
    
  } catch (error) {
    next(error.message);
  }
};
