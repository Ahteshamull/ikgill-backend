import * as wishlistService from "../services/Wishlist.service.js";

export const createWishlist = async (req, res) => {
  try {
    
  //  const data= JSON.parse(req.body.data);
   const data= req.body
   const { name=null }= data;
  
   if(name.trim()==="" || name===" " || name===null ||name===undefined || name=== "undefined"){
    throw new Error("Name is required");
   }


    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file =>
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`
      );
    }
    
   
    const wishlist = await wishlistService.createWishlist(
      req.headers.user_id,
      data,
      imageUrls
    );
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWishlists = async (req, res) => {
  try {
    const wishlists = await wishlistService.getWishlists(req.headers.user_id);
    res.json(wishlists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWishlistById = async (req, res) => {
  try {
    const wishlist = await wishlistService.getWishlistById(req.params.id, req.headers.user_id);
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });
    res.json(wishlist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const deleteWishlist = async (req, res) => {
  try {
    const wishlist = await wishlistService.deleteWishlist(req.params.id, req.headers.user_id);
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });
    res.json({ message: "Wishlist deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const addImagesToWishlist = async (req, res) => {
  try {
     let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file =>
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.key}`
      );
    }
    const wishlist = await wishlistService.addImagesToWishlistService(
      req.params.id,
      req.headers.user_id,
      imageUrls
    );
    res.json(wishlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
