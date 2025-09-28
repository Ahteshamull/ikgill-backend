import Category from "../models/category.js";
import Item from "../models/Item.js";
import Materials from "../models/Materials.js";
import mongoose from "mongoose";
import User from "../models/User.js";

export const createItem = async (data) => {
try {
  const user= await User.findById({_id:data.user})
if(!user) throw new Error("User not found")
if(user.disabled) throw new Error("Account  has disabled")


  const { category, material, ...rest } = data;
console.log(data,"from 7 line")
    // Convert category names to ObjectIds

    const categoryDocs = await Category.find({ name: { $in: category } });
    const materialDocs = await Materials.find({ name: { $in: material } });

console.log(categoryDocs,"kk")
    const item = new Item({
      ...rest,
      category: categoryDocs.map(c => c._id),
      material: materialDocs.map(m => m._id)
    });


console.log(item)

  // const item = new Item({ ...data, user: userId });
  return await item.save();
} catch (error) {
  throw new Error("Error creating item: " + error.message);
  
}
};

export const getItems = async (filters,id) => {

  const user= await User.findById({_id:id})
if(!user) throw new Error("User not found")
if(user.disabled) throw new Error("Account  has disabled")

  if(filters){
    const query = {};
  query.user= id;
  console.log(filters)

// Title search (case-insensitive)
if (filters.title) query.title = { $regex: filters.title, $options: "i" };

// Multiple brands (comma-separated)
if (filters.brand)
  query.brand = { $in: filters.brand.split(",").map((b) => b.trim()) };

// Multiple categories (optional)
if (filters.category) {
  const categories = filters.category.split(",").map((c) => c.trim());

  const regexConditions = categories.map((c) => ({
    name: { $regex: c, $options: "i" }, // partial + case-insensitive
  }));

  const catDocs = await Category.find({
    $or: regexConditions,
  });
  



  // Extract IDs
  const categoryIds = catDocs.map((c) => c._id.toString());
  console.log("categoryIds:", categoryIds);

  if (categoryIds.length > 0) {
    query.category = { $in: categoryIds };
  } else {
    query.category = { $in: [] }; // no match
  }
}
if (filters.material) {
  const metarials = filters.material.split(",").map((c) => c.trim());

  const regexConditions = metarials.map((c) => ({
    name: { $regex: c, $options: "i" }, // partial + case-insensitive
  }));

  const catDocs = await Materials.find({
    $or: regexConditions,
  });
  



  // Extract IDs
  const metarialIds = catDocs.map((c) => c._id.toString());
  // console.log("categoryIds:", metarialIds);

  if (metarialIds.length > 0) {
    query.material = { $in: metarialIds };
  } else {
    query.material = { $in: [] }; // no match
  }
}




  
// if (filters.material)
//   query.material = { $in: filters.material.split(",").map((c) => c.trim()) };

// Colors, season, style
if (filters.colors)
  query.colors = { $in: filters.colors.split(",").map((c) => c.trim()) };

if (filters.season)
  query.season = { $in: filters.season.split(",").map((s) => s.trim()) };

if (filters.style)
  query.style = { $in: filters.style.split(",").map((s) => s.trim()) };
 
    const items = await Item.find(query)
  .populate("category", "name -_id")  // only return category name
  .populate("material", "name -_id")
  .lean(); // only return material name

const result = items.map(item => (
{
  ...item,
  category: item.category?.[0]?.name || null,   // pick first category name
  material: item.material?.[0]?.name || null,   // pick first material name
}));
console.log(result)
return result;
  
    
  }
  else{
    const item = await Item.findById({user:id})
    .populate("category", "name -_id")   
    .populate("material", "name -_id")
    .lean(); 
    const result ={
  ...item,
  category: item.category?.[0]?.name || null,   // pick first category name
  material: item.material?.[0]?.name || null,   // pick first material name
}
    return result
  }
};

export const getItemById = async (id,user) => {
  const user1= await User.findById({_id:user})
if(!user1) throw new Error("User not found")
if(user1.disabled) throw new Error("Account  has disabled")

    const item= await Item.findById(id)
   
    return item;
};



export const updateItem = async (id, data, user) => {
  try {
    const user= await User.findById({_id:user})
if(!user) throw new Error("User not found")
if(user.disabled) throw new Error("Account  has disabled")

    const query = {};
    console.log("Updating item with data:", data);

    // Handle category update
    if (data.category) {
      let cat = await Category.findOne({ items: id, name: data.category, user });

      if (cat) {
        query.category = [cat._id]; // must be an array of ObjectIds
      } 
      
    }
    if (data.material) {
      let cat = await Materials.findOne({  name: data.material, user });

      if (cat) {
        query.material = [cat._id]; // must be an array of ObjectIds
      } 
    }

    // Handle title update
    if (data.title) {
      query.title = data.title;
    }

    // Handle brand update
    if (data.brand) {
      query.brand = data.brand;
    }

    // Handle other optional fields
    // if (data.material) query.material = data.material;
    if (data.colors) query.colors = data.colors;
    if (data.season) query.season = data.season;
    if (data.style) query.style = data.style;
    if (data.image) query.image = data.image;

    console.log("Update query:", query);
const ob = await Item.findById(id)
console.log("dkls",ob,"kd")
    // Update item only if it belongs to the user
   const item = await Item.findByIdAndUpdate(
      { _id: id, user },
  query,
  { new: true, runValidators: true }
);

console.log(item)
    if (!item) {
      throw new Error("Item not found or not authorized");
    }

    console.log("Updated item:", item);
    return item;

  } catch (error) {
    console.error("Error updating item:", error.message);
    throw error;
  }
};

  

export const deleteItem = async (id) => {
  
     await Item.findByIdAndDelete({ _id: id });
    return "user has been deleted successfully";
};





export const getBrandsByUser = async (userId) => {
  try {
    // using distinct to get unique brand values for that user
    const brands = await Item.distinct("brand", { user: userId });
    return brands;
  } catch (error) {
    throw new Error("Failed to fetch brands: " + error.message);
  }
};



