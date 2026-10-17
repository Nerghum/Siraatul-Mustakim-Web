import status from "http-status";
import * as subjectService from "../services/quranSubjectService.js";

const create = async (req, res) => {
  try {
    const data = req.body;
    const result = await subjectService.createSubject(data);
    res.status(status.CREATED).json({ data: result , message: "Subject created successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await subjectService.updateSubject(id, updates);
    res.status(status.OK).json({ data: result });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subjectService.deleteSubject(id);
    res.status(status.OK).json({ data: result });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const single = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await subjectService.getSubject(id);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const search = async (req, res) => {
  try {
    const data = await subjectService.searchSubjects(req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const listAll = async (req, res) => {
  try {
    const data = await subjectService.listAllSubjects(req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const listByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const data = await subjectService.listAllSubjects({ categoryId });
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export { create, edit, remove, single, search, listAll, listByCategory };
