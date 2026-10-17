import status from "http-status";
import * as masailService from "../services/masailService.js";


const getAllMasails = async (req, res) => {
    try {
        const masails = await masailService.getAllMasails();
        res.status(status.OK).json(masails);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await masailService.getCategories();
        res.status(status.OK).json(categories);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await masailService.createCategory(req.body);
        res.status(status.CREATED).json(category);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await masailService.updateCategory(req.params.id, req.body);
        res.status(status.OK).json(category);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await masailService.deleteCategory(req.params.id);
        res.status(status.OK).json({ message: "Category deleted" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const getMasailById = async (req, res) => {
    const { id } = req.params;
    try {
        const masail = await masailService.getMasailById(id);
        res.status(status.OK).json(masail);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const createMasail = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res
            .status(status.BAD_REQUEST)
            .json({ error: "Title and description are required" });
    }
    try {
        const masail = await masailService.createMasail(req.body);
        res.status(status.CREATED).json(masail);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const deleteMasail = async (req, res) => {
    const { id } = req.params;
    try {
        await masailService.deleteMasailById(id);
        res.status(status.OK).json({ message: "Masail deleted" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const updateMasail = async (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;
    if (title === undefined && description === undefined && category === undefined) {
        return res
            .status(status.BAD_REQUEST)
            .json({ error: "Provide title, description or category" });
    }
    try {
        const masail = await masailService.updateMasail(id, req.body);
        res.status(status.OK).json(masail);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

export { 
  getAllMasails, 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getMasailById, 
  createMasail, 
  deleteMasail, 
  updateMasail 
};
