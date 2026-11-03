import status from "http-status";
import * as faqService from "../services/faqService.js";
import Settings from "../models/Settings.js";

const createFaq = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res
      .status(status.BAD_REQUEST)
      .json({ error: "Question is required" });
  }
  try {
    const settings = await Settings.findOne();
    if (settings && settings.isQuestionsEnabled === false) {
      return res.status(status.FORBIDDEN).json({
        error: "প্রশ্নোত্তর সেবা বর্তমানে বন্ধ রয়েছে। নতুন প্রশ্ন গ্রহণ করা হচ্ছে না।"
      });
    }

    const faq = await faqService.createFaq(req.body);
    res.status(status.CREATED).json(faq);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const addAnswer = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.body.userId || req.user?.id || req.user?._id;
    const author = req.body.author || req.user?.name || "Mufti";
    const payload = {
      ...req.body,
      userId: userId || undefined,
      author,
    };
    const faq = await faqService.addAnswer(id, payload);
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
