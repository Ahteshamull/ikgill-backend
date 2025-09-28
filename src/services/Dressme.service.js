import DressMe from "../models/DressMe.js";
import Group from "../models/group.js";
import User from "../models/User.js";


export const createDressMe = async ({ title, style, season, groupsData },userId) => {
  
const user= await User.findById({_id:userId})
if(!user) throw new Error("User not found")
if(user.disabled) throw new Error("Account  has disabled")


  const groupIds = [];
  

  for (const g of groupsData) {
    const group = new Group({
      title: g.title,
      items: g.itemIds
    });
    
    await group.save();
    groupIds.push(group._id);
    
  }
  const createDressMe = await DressMe.create({
    title,
    style,
    season,
    groups: groupIds,
    user: userId 
  })
  const populatedDressMe = await DressMe.findById(createDressMe._id)
  .populate({
    path: "groups",
    populate: { path: "items" } // nested populate for items
  });
 
  return populatedDressMe;

};

export const editDressMe = async (DressMeId, updateData) => {
  const DressMe = await DressMe.findById(DressMeId);
  if (!DressMe) throw new Error("Outfit not found");

  
  if (updateData.groupsData) {
   
    await Group.deleteMany({ _id: { $in: DressMe.groups } });

    const newGroupIds = [];
    for (const g of updateData.groupsData) {
      const group = new Group({
        title: g.title,
        items: g.itemIds
      });
      await group.save();
      newGroupIds.push(group._id);
    }
    DressMe.groups = newGroupIds;
  }

  // Update other fields
  if (updateData.title) DressMe.title = updateData.title;
  if (updateData.style) DressMe.style = updateData.style;
  if (updateData.season) DressMe.season = updateData.season;

  return await outfit.save();
};

export const deleteDressMe = async (DressMeId) => {
  const DressMeFind = await DressMe.findById(DressMeId);
  if (!DressMeFind) throw new Error("DressMe not found");

  // Optional: delete groups associated with this outfit
  await Group.deleteMany({ _id: { $in: DressMeFind.groups } });

  return await DressMe.findByIdAndDelete(DressMeId);
};

export const getDressMe = async (userId) => {
  const DressMeFind = await DressMe.find({ user: userId }) // assuming `user` is an array of ObjectIds
    .populate({
      path: "groups",
      populate: { path: "items", select: "image -_id" } // only get images
    });

  // Transform data
  return DressMeFind.map(DressMe => ({
    title: DressMe.title,
    style: DressMe.style,
    season: DressMe.season,
    items: DressMe.groups.flatMap(group =>
      group.items.map(item => item.image)
    )
  }));
};


export const getDressMeDetails = async (DressMeId) => {
  // Populate groups and their items
  const DressMeFind = await DressMe.findById(DressMeId)
    .populate({
      path: "groups",
      populate: { path: "items", select: "image -_id" } // only image field
    });

  if (!DressMeFind) throw new Error("DressMe not found");

  // Extract all item images
  const itemImages = DressMeFind.groups.flatMap(group => 
    group.items.map(item => item.image)
  );

  // Build response
  return {
    title: DressMeFind.title,
    style: DressMeFind.style,
    season: DressMeFind.season,
    items: itemImages
  };
};


