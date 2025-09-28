import User from "../models/User.js";




export const getUserProfile = async (userId) => {
    
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};
export const updateProfile = async (userId, updateData,file) => {
try {
  //  const  updateData= JSON.parse(updatedData);
   console.log(updateData,"from service")
  const user = await User.findById(userId)
// console.log(user)
  if (!user) {
    throw new Error("User not found");
  }


  // If image is provided

  if (file) {
   
    user.profileImage = file;
  }

  // Update only provided fields (PATCH behavior)
  if (updateData.name) user.name = updateData.name;
  if(updateData.username)user.username=updateData.username;
  if(updateData.gender)user.gender=updateData.gender;
  if (updateData.bio) user.bio = updateData.bio;
  if (updateData.phone)user.phone = updateData.phone;
  if(updateData.language)user.language= updateData.language
  if(updateData.dob)user.dob= updateData.dob
  if(updateData.location)user.location= updateData.location
  
  await user.save();
  
  return user;
  
} catch (error) {
  console.log(error)
  return error
}
};

