import status from "http-status";
import * as faqService from "../services/faqService.js";
const createFaq = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res
      .status(status.BAD_REQUEST)
      .json({ error: "Question is required" });
  }
  try {
    const faq = await faqService.createFaq(req.body);
    res.status(status.CREATED).json(faq);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const addAnswer = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await faqService.addAnswer(id, req.body);
    res.status(status.OK).json(faq);
  } catch (error) {
    const code = error.message.includes("Mufti") || error.message.includes("not found")
      ? status.BAD_REQUEST
      : status.INTERNAL_SERVER_ERROR;
    res.status(code).json({ error: error.message });
  }
};

const getAllFaqs = async (req, res) => {
  try {
    const faqs = await faqService.getAllFaqs(req.query);
    res.status(status.OK).json(faqs);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getFaqById = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await faqService.getFaqById(id);
    res.status(status.OK).json(faq);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const deleteFaq = async (req, res) => {
  const { id } = req.params;
  try {
    await faqService.deleteFaq(id);
    res.status(status.NO_CONTENT).end();
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getFaqFilters = async (req, res) => {
  try {
    const filters = await faqService.getFaqFilters();
    res.status(status.OK).json(filters);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export { createFaq, addAnswer, getAllFaqs, getFaqFilters, getFaqById, deleteFaq };
