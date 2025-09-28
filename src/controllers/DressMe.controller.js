import * as DressMeService from "../services/Dressme.service.js";

export const createDressMe = async (req, res) => {
  try {
    const { title, style, season, groupsData } = req.body;
    

    const DressMe = await DressMeService.createDressMe({ title, style, season, groupsData },req.headers.user_id);
    res.status(201).json(DressMe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const editDressMe = async (req, res) => {
  try {
    const DressMeId = req.params.id;
    const updateData = req.body;
    const DressMe = await DressMeService.editDressMe(DressMeId, updateData);
    res.json(DressMe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDressMe = async (req, res) => {
  try {
    const DressMeId = req.params.id;
    await DressMeService.deleteDressMe(DressMeId);
    res.json({ message: "DressMe deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllDressMe = async (req, res) => {
  try {
    
    const DressMe = await DressMeService.getDressMe(req.headers.user_id);
    res.json(DressMe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDressMeDetailsController = async (req, res) => {
  try {
    const DressMeId = req.params.id;
    const DressMeDetails = await DressMeService.getDressMeDetails(DressMeId);
    res.json(DressMeDetails);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

