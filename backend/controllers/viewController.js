import status from "http-status";
import mongoose from "mongoose";
import PageView from "../models/PageView.js";
import Masail from "../models/Masail.js";
import Article from "../models/Article.js";
import Faq from "../models/Faq.js";
import Kitab from "../models/Kitab.js";
import Notice from "../models/notice.js";
import Boyan from "../models/Boyan.js";
import Malfuzat from "../models/Malfuzat.js";

const MODEL_MAP = {
  masail: Masail,
  articles: Article,
  article: Article,
  faq: Faq,
  qa: Faq,
  "question-answer": Faq,
  kitab: Kitab,
  book: Kitab,
  books: Kitab,
  notice: Notice,
  boyan: Boyan,
  bayan: Boyan,
  malfuzat: Malfuzat,
};

function resolveIdentifier({ entityType, entityId, path }) {
  if (entityType && entityId) {
    return `${entityType.toLowerCase()}:${entityId}`;
  }
  if (path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `page:${cleanPath}`;
  }
  return null;
}

export const incrementView = async (req, res) => {
  try {
    const { entityType, entityId, path } = req.body || {};
    const identifier = resolveIdentifier({ entityType, entityId, path });
    if (!identifier) {
      return res.status(status.BAD_REQUEST).json({ error: "entityType & entityId or path is required" });
    }

    // 1. Increment in PageView collection
    const pageView = await PageView.findOneAndUpdate(
      { identifier },
      {
        $inc: { views: 1 },
        $setOnInsert: {
          entityType: entityType ? entityType.toLowerCase() : "page",
          entityId: entityId ? String(entityId) : "",
        },
      },
      { returnDocument: "after", upsert: true }
    );

    let entityViews = pageView.views;

    // 2. If entityType and valid ObjectId, also increment in the entity's model
    if (entityType && entityId && mongoose.Types.ObjectId.isValid(entityId)) {
      const Model = MODEL_MAP[entityType.toLowerCase()];
      if (Model) {
        const updated = await Model.findByIdAndUpdate(
          entityId,
          { $inc: { views: 1 } },
          { returnDocument: "after" }
        );
        if (updated && typeof updated.views === "number") {
          entityViews = updated.views;
        }
      }
    }

    return res.status(status.OK).json({
      identifier,
      views: entityViews,
    });
  } catch (error) {
    console.error("incrementView error:", error);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getViewCount = async (req, res) => {
  try {
    const { entityType, entityId, path, identifier: queryId } = req.query;
    const identifier = queryId || resolveIdentifier({ entityType, entityId, path });
    if (!identifier) {
      return res.status(status.BAD_REQUEST).json({ error: "identifier, entityType & entityId, or path is required" });
    }

    // Check entity first if available
    if (entityType && entityId && mongoose.Types.ObjectId.isValid(entityId)) {
      const Model = MODEL_MAP[entityType.toLowerCase()];
      if (Model) {
        const item = await Model.findById(entityId).select("views").lean();
        if (item && typeof item.views === "number") {
          return res.status(status.OK).json({ identifier, views: item.views });
        }
      }
    }

    const pageView = await PageView.findOne({ identifier }).lean();
    return res.status(status.OK).json({
      identifier,
      views: pageView?.views || 0,
    });
  } catch (error) {
    console.error("getViewCount error:", error);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getBatchViews = async (req, res) => {
  try {
    const { identifiers = [] } = req.body || {};
    if (!Array.isArray(identifiers) || identifiers.length === 0) {
      return res.status(status.OK).json({ views: {} });
    }

    const viewsList = await PageView.find({ identifier: { $in: identifiers } }).lean();
    const result = {};
    for (const id of identifiers) {
      result[id] = 0;
    }
    for (const item of viewsList) {
      result[item.identifier] = item.views;
    }

    return res.status(status.OK).json({ views: result });
  } catch (error) {
    console.error("getBatchViews error:", error);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
