import mongoose from "mongoose";
import Faq from "../models/Faq.js";
import User from "../models/User.js";

const createFaq = async (data) => {
  const { author, district, question, isPrivate, phone } = data;

  if (!author || !question) {
    throw new Error("Author and question are required");
  }

  const faq = await Faq.create({
    question: {
      author,
      district,
      question,
      isPrivate: isPrivate || false,
      phone,
    },
    status: "",
    answer: null,
  });

  return faq;
};

const addAnswer = async (faqId, data) => {
  // Validate that the selected userId belongs to an authorized user
  if (data.userId) {
    const user = await User.findById(data.userId).lean();
    if (!user) throw new Error("User not found");
    if (!["mufti", "admin", "moderator"].includes(user.role)) {
      throw new Error("Only Muftis, Admins, or Moderators can answer FAQs");
    }
  }

  const faq = await Faq.findById(faqId);
  if (!faq) throw new Error("FAQ not found");

  faq.answer = {
    userId: data.userId || undefined,
    author: data.author,
    category: data.category,
    answer: data.answer,
    timestamp: new Date(),
  };
  faq.status = data.status || "answered";
  await faq.save();

  return faq;
};

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/** Regex matching a BD phone in any format (01..., 880..., +880...) via its last 10 digits. */
const phoneRegex = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 10) return escapeRegex(String(value || ""));
  return `${digits.slice(-10)}$`;
};

const categoryEquivalents = {
  namaz: ["namaz", "নামাজ", "নামায"],
  roza: ["roza", "রোজা", "রোযা"],
  zakat: ["zakat", "যাকাত"],
  hajj: ["hajj", "হজ্জ", "হজ"],
  iman: ["iman", "ঈমান"],
  aqida: ["aqida", "আকিদা", "আক্বীদা"],
  muamalat: ["muamalat", "মুয়ামালাত", "মুআমালাত", "মুআ'মালাত"],
  muasharat: ["muasharat", "মুয়াশারাত", "মুআশারাত", "মুআ'শারাত"],
  akhlaq: ["akhlaq", "আখলাক"],
  "dawat-tabligh": ["dawat-tabligh", "দাওয়াত ও তাবলীগ", "দাওয়াত", "তাবলীগ"],
  islah: ["islah", "ইসলাহ", "তাসকিয়াহ", "আত্মশুদ্ধি"],
  biye: ["biye", "বিবাহ", "বিয়ে"],
  ilm: ["ilm", "ইলম"],
  taharat: ["taharat", "তাহারাত", "পবিত্রতা"],
  janaza: ["janaza", "জানাযা", "জানাযাহ"],
  samakal: ["samakal", "সমকাল"],
  jiboni: ["jiboni", "জীবনী"],
  dawati: ["dawati", "দাওয়াতী", "দাওয়াতি"],
  fikri: ["fikri", "ফিকরী", "ফিকরি"],
  ibadat: ["ibadat", "ইবাদত"],
  poribar: ["poribar", "পরিবার"],
};

const getAllFaqs = async (query = {}) => {
  try {
    const filter = {};

    // Combine author and phone conditions if both are provided.
    const authorConditions = [];

    if (query.author) {
      const searchString = escapeRegex(query.author);
      // If the author looks like a phone number, match it in any format.
      if (/^\+?\d{10,}$/.test(String(query.author).trim())) {
        const pr = phoneRegex(query.author);
        authorConditions.push({ "question.author": { $regex: pr, $options: "i" } });
        authorConditions.push({ "question.phone": { $regex: pr, $options: "i" } });
      } else {
        authorConditions.push({ "question.author": { $regex: searchString, $options: "i" } });
        if (query.status === "answered") {
          authorConditions.push({ "answer.author": { $regex: searchString, $options: "i" } });
        }
      }
    }

    if (query.phone) {
      const pr = phoneRegex(query.phone);
      authorConditions.push({ "question.phone": { $regex: pr, $options: "i" } });
      authorConditions.push({ "question.author": { $regex: pr, $options: "i" } }); // in case older ones used phone as author
    }

    const andConditions = [];

    if (authorConditions.length > 0) {
      andConditions.push({ $or: authorConditions });
    }

    if (query.answerAuthor) {
      const searchAuthor = escapeRegex(query.answerAuthor);
      const answerAuthorConditions = [
        { "answer.author": { $regex: searchAuthor, $options: "i" } },
      ];
      try {
        const matchedUsers = await User.find({ name: { $regex: searchAuthor, $options: "i" } }).select("_id").lean();
        if (matchedUsers.length > 0) {
          answerAuthorConditions.push({ "answer.userId": { $in: matchedUsers.map((u) => u._id) } });
        }
      } catch (e) {
        // ignore
      }
      andConditions.push({ $or: answerAuthorConditions });
    }

    if (query.category) {
      const catKey = query.category.toLowerCase().trim();
      const equivs = categoryEquivalents[catKey];
      if (equivs && equivs.length > 0) {
        filter["answer.category"] = { $regex: equivs.map(escapeRegex).join("|"), $options: "i" };
      } else {
        filter["answer.category"] = { $regex: escapeRegex(query.category), $options: "i" };
      }
    }

    if (query.status) {
      if (query.status === "pending") {
        filter.status = { $in: ["", "pending"] };
      } else {
        filter.status = query.status;
      }
    }
    if (query.district) {
      filter["question.district"] = { $regex: escapeRegex(query.district), $options: "i" };
    }
    
    const searchTerm = query.search || query.q;
    if (searchTerm) {
      const escapedSearch = escapeRegex(searchTerm);
      const searchOr = [
        { "question.question": { $regex: escapedSearch, $options: "i" } },
        { "question.author": { $regex: escapedSearch, $options: "i" } },
        { "question.district": { $regex: escapedSearch, $options: "i" } },
        { "answer.answer": { $regex: escapedSearch, $options: "i" } },
        { "answer.author": { $regex: escapedSearch, $options: "i" } },
        { "answer.category": { $regex: escapedSearch, $options: "i" } },
      ];
      try {
        const matchedUsers = await User.find({ name: { $regex: escapedSearch, $options: "i" } }).select("_id").lean();
        if (matchedUsers.length > 0) {
          searchOr.push({ "answer.userId": { $in: matchedUsers.map((u) => u._id) } });
        }
      } catch (e) {
        // ignore
      }
      andConditions.push({ $or: searchOr });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    if (query.isPrivate !== undefined) {
      if (query.isPrivate === "false") {
        // filter out private questions
        filter["question.isPrivate"] = { $ne: true };
      } else if (query.isPrivate === "true") {
        // only show private questions
        filter["question.isPrivate"] = true;
      }
    }

    const faqs = await Faq.find(filter)
      .populate("answer.userId", "name email role")
      .sort({ createdAt: -1 });
    return faqs;
  } catch (error) {
    throw error;
  }
};

const getFaqFilters = async () => {
  try {
    const authors = await Faq.distinct("question.author");
    const districts = await Faq.distinct("question.district");
    const rawStatuses = await Faq.distinct("status");

    // Map raw statuses: empty string and 'pending' both become 'pending'
    const statusSet = new Set();
    rawStatuses.forEach((s) => {
      if (s === "" || s === "pending") {
        statusSet.add("pending");
      } else if (s) {
        statusSet.add(s);
      }
    });

    return {
      authors: authors.filter(Boolean).sort(),
      districts: districts.filter(Boolean).sort(),
      statuses: Array.from(statusSet).sort(),
    };
  } catch (error) {
    throw error;
  }
};

const getFaqById = async (id) => {
  try {
    const faq = await Faq.findById(id).populate("answer.userId", "name email role");

    if (!faq) {
      throw new Error("FAQ not found");
    }

    return faq;
  } catch (error) {
    throw error;
  }
};



const deleteFaq = async (id) => {
  const faq = await Faq.findById(id);
  if (!faq) throw new Error("FAQ not found");
  await faq.deleteOne();
  return faq;

}

export { createFaq, addAnswer, getAllFaqs, getFaqFilters, getFaqById, deleteFaq };
