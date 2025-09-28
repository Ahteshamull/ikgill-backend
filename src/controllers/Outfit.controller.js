import { json } from "zod";
import {
  createOutfit,
  getUserOutfits,
  getOutfitById,
  updateOutfit,
  deleteOutfit,
} from "../services/Outfit.service.js";

// ➕ Create Outfit
//
export const createOutfitController = async (req, res) => {
  try {
    const userId = req.headers.user_id;

    // const { title, season, style } = JSON.parse(req.body.data);
    // const data=JSON.parse(req.body.data)
    // const data=(req.body.data)
   
   const data = req.body;
    const { title=null, season=null, style=null } = data;
     if(title==="" || title===undefined||title===null|| title==="undefined" || title.trim(" ").length===0){
      return res.status(400).json({ message: "Title is required" });
    }
    if(season==="" || season===undefined||season===null || season==="undefined"){
      return res.status(400).json({ message: "Season is required" });
    }
    if(style==="" || style===undefined||style===null || style==="undefined"){
      return res.status(400).json({ message: "Style is required" });
    }
     // const { title, season, style} = req.body;
    
    console.log("Parsed data:", title, season, style);
    let imageUrl = null;
if (req.file) {
  imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}
    if (!imageUrl) return res.status(400).json({ error: "Image is required" });


    // Use let here so we can reassign later
    // let imagePath = null;
    // if (req.file) {
    //   imagePath = `/uploads/outfits/${req.file.originalname}`;
    // }

    // if (!imagePath) return res.status(400).json({ error: "Image is required" });

    // const outfit = await createOutfit(userId, { title, season, style, image: imagePath });
    const outfit = await createOutfit(userId, { title, season, style, image: imageUrl });
    res.status(201).json(outfit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// export const createOutfitController = async (req, res) => {
//   try {
//     const userId = req.headers.user_id;
//   console.log("12")
//   let jsonString = req.body.text;

// // Remove surrounding quotes (single or double)
// jsonString = jsonString.trim();
// if (
//   (jsonString.startsWith("'") && jsonString.endsWith("'")) ||
//   (jsonString.startsWith('"') && jsonString.endsWith('"'))
// ) {
//   jsonString = jsonString.slice(1, -1);
// }

// // Optional: unescape quotes inside
// jsonString = jsonString.replace(/\\"/g, '"').replace(/\\'/g, "'");
// console.log(JSON.parse(jsonString))
//      const {title,season,style} = JSON.parse(req.body.text);
//      console.log("line15")
//      console.log(title,season,style)
//     //  const {title,season,style} = req.body

//     // file comes from multer
//     const imagePath = req.file ? req.file.path : null;
//     if (!imagePath) return res.status(400).json({ error: "Image is required" });

//     const outfit = await createOutfit(userId, { title, season, style, image: imagePath });
//     res.status(201).json(outfit);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// ✏️ Update Outfit
export const updateOutfitController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const outfitId = req.params.id;
    let updateData = {};
    if (req.body) {
      //  const { title, season, style } = JSON.parse(req.body.data);
      const { title = null, season = null, style = null} = req.body;

      // If new image is uploaded
      updateData = { title, season, style  };
    }
    if (req.file) {


    if (req.file) {
  updateData.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`;
}
    }

    const outfit = await updateOutfit(outfitId, userId, updateData);
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });

    res.json(outfit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserOutfitsController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const outfits = await getUserOutfits(userId);
    res.json(outfits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Read single outfit
export const getOutfitByIdController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const outfitId = req.params.id;
    console.log(outfitId);

    const outfit = await getOutfitById(outfitId, userId);
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });

    res.json(outfit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOutfitController = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const outfitId = req.params.id;

    const deleted = await deleteOutfit(outfitId, userId);
    if (!deleted) return res.status(404).json({ message: "Outfit not found" });

    res.json({ message: "Outfit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
