import status from "http-status";
import mongoose from "mongoose";
import Article from "../models/Article.js";
import User from "../models/User.js";

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

export const createArticle = async (req, res) => {
  try {
    const { title, content, status: articleStatus, tags } = req.body;

    if (!title || !content) {
      return res.status(status.BAD_REQUEST).json({ error: "Title and content are required" });
    }

    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) parsedTags = tags;
      else if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
          if (!Array.isArray(parsedTags)) parsedTags = [parsedTags.toString()];
        } catch(e) {
          parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
    }

    const article = new Article({
      title,
      content,
      author: req.user.id,
      status: articleStatus || "published",
      tags: parsedTags,
    });

    if (req.file) {
      // Assuming they might upload an image, just store the path or url
      article.image = req.file.path || req.file.filename;
    } else if (req.body.image) {
      article.image = req.body.image;
    }

    await article.save();
    res.status(status.CREATED).json(article);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getArticles = async (req, res) => {
  try {
    const { status: queryStatus, author, category, tag, search, q, limit = 20, page = 1 } = req.query;
    const filter = {};

    // Determine access permissions:
    // Staff (admin, moderator, mufti): can see all articles (drafts, pending, published)
    // Regular logged in user: can see published articles OR their own drafts
    // Public visitor: only published articles
    const isStaff = req.user && ["admin", "moderator", "mufti"].includes(req.user.role);

    if (isStaff) {
      if (queryStatus) filter.status = queryStatus;
    } else if (req.user) {
      if (author && author === req.user.id) {
        filter.author = req.user.id;
        if (queryStatus) filter.status = queryStatus;
      } else {
        filter.$or = [
          { status: "published" },
          { author: req.user.id },
        ];
        if (queryStatus) {
          filter.status = queryStatus;
          filter.author = req.user.id;
          delete filter.$or;
        }
      }
    } else {
      filter.status = "published";
    }

    if (author && (!req.user || author !== req.user.id || isStaff)) {
      if (mongoose.Types.ObjectId.isValid(author)) {
        filter.author = author;
      } else {
        const matchedUsers = await User.find({ name: { $regex: author.trim(), $options: "i" } }).select("_id").lean();
        filter.author = { $in: matchedUsers.map((u) => u._id) };
      }
    }

    if (category || tag) {
      const catKey = (category || tag).toLowerCase().trim();
      const equivs = categoryEquivalents[catKey];
      if (equivs && equivs.length > 0) {
        filter.tags = { $regex: new RegExp(equivs.map((e) => e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')).join("|"), "i") };
      } else {
        filter.tags = { $regex: new RegExp((category || tag).trim(), "i") };
      }
    }

    const searchTerm = (search || q || "").trim();
    if (searchTerm) {
      const safeRegex = new RegExp(searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
      let matchedUserIds = [];
      try {
        const matchedUsers = await User.find({ name: safeRegex }).select("_id").lean();
        matchedUserIds = matchedUsers.map((u) => u._id);
      } catch (err) {
        // ignore
      }

      const searchOr = [
        { title: safeRegex },
        { content: safeRegex },
        { tags: safeRegex },
      ];
      if (matchedUserIds.length > 0) {
        searchOr.push({ author: { $in: matchedUserIds } });
      }

      if (filter.$or) {
        const existingOr = filter.$or;
        delete filter.$or;
        filter.$and = filter.$and || [];
        filter.$and.push({ $or: existingOr }, { $or: searchOr });
      } else if (filter.$and) {
        filter.$and.push({ $or: searchOr });
      } else {
        filter.$or = searchOr;
      }
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("author", "name email role avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.status(status.OK).json({
      data: articles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid article id" });
    }

    const article = await Article.findById(id).populate("author", "name email role avatar").lean();
    
    if (!article) {
      return res.status(status.NOT_FOUND).json({ error: "Article not found" });
    }

    // if not published, only author or staff (admin/moderator/mufti) can see it
    if (article.status !== "published") {
      const authorId = article.author?._id ? article.author._id.toString() : article.author?.toString();
      const isStaff = req.user && ["admin", "moderator", "mufti"].includes(req.user.role);
      const isOwner = req.user && authorId && req.user.id === authorId;
      if (!isStaff && !isOwner) {
        return res.status(status.FORBIDDEN).json({ error: "Access denied" });
      }
    }

    res.status(status.OK).json(article);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid article id" });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(status.NOT_FOUND).json({ error: "Article not found" });
    }

    // Only author or staff (admin/moderator/mufti) can update
    const authorId = article.author ? article.author.toString() : null;
    const isStaff = req.user && ["admin", "moderator", "mufti"].includes(req.user.role);
    const isOwner = req.user && authorId && req.user.id === authorId;
    if (!isStaff && !isOwner) {
      return res.status(status.FORBIDDEN).json({ error: "Not authorized to update this article" });
    }

    const { title, content, status: articleStatus, tags } = req.body;

    if (title) article.title = title;
    if (content) article.content = content;
    
    // Only admin/moderator can change status to published or something else freely
    if (articleStatus) {
      if (req.user.role === "admin" || req.user.role === "moderator" || req.user.role === "writer" || req.user.role === "mufti") {
        article.status = articleStatus;
      }
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        article.tags = tags;
      } else if (typeof tags === 'string') {
        try {
          const pt = JSON.parse(tags);
          article.tags = Array.isArray(pt) ? pt : [pt.toString()];
        } catch(e) {
          article.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      } else {
        article.tags = [];
      }
    }

    if (req.file) {
      article.image = req.file.path || req.file.filename;
    } else if (req.body.image !== undefined) {
      article.image = req.body.image;
    }

    await article.save();
    res.status(status.OK).json(article);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid article id" });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(status.NOT_FOUND).json({ error: "Article not found" });
    }

    // Only author or staff (admin/moderator/mufti) can delete
    const authorId = article.author ? article.author.toString() : null;
    const isStaff = req.user && ["admin", "moderator", "mufti"].includes(req.user.role);
    const isOwner = req.user && authorId && req.user.id === authorId;
    if (!isStaff && !isOwner) {
      return res.status(status.FORBIDDEN).json({ error: "Not authorized to delete this article" });
    }

    await Article.findByIdAndDelete(id);
    res.status(status.OK).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
