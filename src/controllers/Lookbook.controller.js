import * as lookbookService from "../services/Lookbook.service.js";

// Create
export const createLookbook = async (req, res) => {
  try {
    
    console.log("Creating Lookbook with data:", req.body.name);
    const { name=null }= req.body;
   if(name.trim()==="" || name===" " || name===null ||name===undefined || name=== "undefined"){
    throw new Error("Lookbook Name is required");
   }
    const lookbook = await lookbookService.createLookbook(req.body, req.headers.user_id);
    res.status(201).json(lookbook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All
export const getLookbooks = async (req, res) => {
  try {
    const lookbooks = await lookbookService.getLookbooks(req.headers.user_id);
    res.json(lookbooks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Single
export const getLookbookById = async (req, res) => {
  try {
    const lookbook = await lookbookService.getLookbookById(req.params.id, req.headers.user_id);
    if (!lookbook) return res.status(404).json({ message: "Lookbook not found" });
    res.json(lookbook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update
export const updateLookbook = async (req, res) => {
  try {
    const lookbook = await lookbookService.updateLookbook(req.params.id, req.body, req.headers.user_id);
    res.json(lookbook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
export const deleteLookbook = async (req, res) => {
  try {
    await lookbookService.deleteLookbook(req.params.id, req.headers.user_id);
    res.json({ message: "Lookbook deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add items/outfits
export const addToLookbook = async (req, res) => {
  try {
    const lookbook = await lookbookService.addToLookbook(req.params.id, req.body, req.headers.user_id);
    res.json(lookbook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



export const removeFromLookbookController = async (req, res) => {
  try {
    const { lookbookId } = req.params;
    const { ids } = req.body; // array of item or outfit ids

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Provide an array of ids to remove" });
    }

    const result = await lookbookService.removeFromLookbookService(lookbookId, ids);

    res.status(200).json({
      message: result.message || "Removed successfully",
      lookbook: result._id ? result : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
