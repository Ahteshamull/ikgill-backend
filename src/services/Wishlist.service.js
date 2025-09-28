import Wishlist from "../models/Wishlist.js";


const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

// export const createWishlist = async (userId, data, images) => {


//     const existingWishlists = await Wishlist.find({ user: userId, name:data.name });

//   for (const wishlist of existingWishlists) {
//     if (arraysEqual(wishlist.images, images)) {
//       throw new Error("A wishlist with the same name and images already exists");
//     }
//   }
//   const wishlist = new Wishlist({
//     user: userId,
//     name: data.name,
//     images
//   });
//   return await wishlist.save();
// };




export const createWishlist = async (userId, data, images) => {

    if(images.length === 0) {
        throw new Error("At least one image is required to create a wishlist");
    }
    const existingWishlists = await Wishlist.find({ user: userId, name:data.name });
    if(existingWishlists.length ===0) {

 const wishlist = new Wishlist({
    user: userId,
    name: data.name,
    images
  })
  return await wishlist.save();

    }
    else{
     console.log("Existing wishlists with same name:", existingWishlists);
     const wishlist = await Wishlist.findByIdAndUpdate({_id: existingWishlists[0]._id}, { $addToSet: { images: { $each: images } } }, { new: true });
     console.log("Updated wishlist:", wishlist);
     return wishlist;
    }

      // throw new Error("A wishlist with the same name already exists");
    }
export const getWishlists = async (userId) => {
  return await Wishlist.find({ user: userId });
};


export const getWishlistById = async (id, userId) => {
  return await Wishlist.findOne({ _id: id, user: userId });
};



export const addImagesToWishlistService = async (wishlistId, userId, newImages) => {
  const wishlist = await Wishlist.findOne({ _id: wishlistId, user: userId });
  if (!wishlist) throw new Error("Wishlist not found");

  // filter out duplicates from the wishlist
  const uniqueNewImages = newImages.filter((img) => !wishlist.images.includes(img));

  // if no new images to add, return current wishlist
  if (uniqueNewImages.length === 0) return wishlist;

  const updatedImages = [...wishlist.images, ...uniqueNewImages];

  // check for duplicate wishlist with same name & updated images
  const existingWishlists = await Wishlist.find({ user: userId, name: wishlist.name, _id: { $ne: wishlistId } });
  for (const w of existingWishlists) {
    if (arraysEqual(w.images, updatedImages)) {
      throw new Error("Another wishlist with same name and images already exists");
    }
  }

  wishlist.images = updatedImages;
  await wishlist.save();

  return wishlist;
};

export const deleteWishlist = async (id, userId) => {
  return await Wishlist.findOneAndDelete({ _id: id, user: userId });
};
