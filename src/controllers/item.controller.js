import { json } from "express";
import * as itemService from "../services/item.service.js";

export const createItem = async (req, res, next) => {
  try {
    
    // const data =JSON.parse(req.body.data);
    const data=req.body;
    console.log(data,"from 6th")
    const {title=null, brand=null, category=null, season=null, style=null}= data;
    console.log(title, brand, category, season, style,"from 8th")
    if(title==="" || title==='undefined'||title===null ||title.trim(" ").length===0){
      return res.status(400).json({ message: "Title is required" });
    }
    if(brand==="" || brand==='undefined'||brand===null){
      return res.status(400).json({ message: "Brand is required" });
    }
    if(category==="" || category==='undefined'||category===null){
      return res.status(400).json({ message: "Category is required" });
    }
    if(season==="" || season==='undefined'||season===null){
      return res.status(400).json({ message: "Season is required" });
    }
    if(style==="" || style==='undefined'||style===null){
      return res.status(400).json({ message: "style is required" });
    }

    console.log(data,"from 9th")
    
    
if (req.file) {
  data.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}
if(!data.image || data.image==="undefined" || data.image===null || data.image.trim(" ").length===0){
  return res.status(400).json({ message: "Image is required" });
}
    data.user= req.headers.user_id;
    const item = await itemService.createItem(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const items = await itemService.getItems(req.query, req.headers.user_id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id,req.headers.user_id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    // const data = JSON.parse(req.body.data);
    const data = req.body
    console.log(data)
    
    if (req.file) {
  data.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}
    const item = await itemService.updateItem(req.params.id, data, req.headers.user_id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await itemService.deleteItem(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};



export const getBrandsByUserController = async (req, res) => {
  try {
    const userId= req.headers.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const brands = await itemService.getBrandsByUser(userId);

    res.status(200).json({
      success: true,
      count: brands.length,
      message: "Brands fetched successfully",
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




