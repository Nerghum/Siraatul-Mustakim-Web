import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      author: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: false,
      },
      question: {
        type: String,
        required: true,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
    },
    answer: {
      type: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        author: String,
        category: String,
        answer: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Faq", faqSchema);
