import status from "http-status";
import mongoose from "mongoose";
import Article from "../models/Article.js";

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
    const { status: queryStatus, author, limit = 20, page = 1 } = req.query;
    const filter = {};

    // Only allow public to see published, unless admin/moderator, or author
    if (req.user && (req.user.role === "admin" || req.user.role === "moderator")) {
      if (queryStatus) filter.status = queryStatus;
    } else {
      // Regular users or writers
      if (req.user && author === req.user.id) {
        filter.author = req.user.id;
        if (queryStatus) filter.status = queryStatus;
      } else {
        filter.status = "published";
      }
    }

    if (author && (!req.user || author !== req.user.id)) {
        filter.author = author;
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

    // if not published, only author or admin can see it
    if (article.status !== "published") {
      if (!req.user || (req.user.role !== "admin" && req.user.role !== "moderator" && req.user.id !== article.author._id.toString())) {
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

    // Only author or admin/moderator can update
    if (req.user.role !== "admin" && req.user.role !== "moderator" && req.user.id !== article.author.toString()) {
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

    // Only author or admin/moderator can delete
    if (req.user.role !== "admin" && req.user.role !== "moderator" && req.user.id !== article.author.toString()) {
      return res.status(status.FORBIDDEN).json({ error: "Not authorized to delete this article" });
    }

    await Article.findByIdAndDelete(id);
    res.status(status.OK).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
