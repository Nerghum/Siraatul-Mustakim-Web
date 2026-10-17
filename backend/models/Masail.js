import mongoose from "mongoose";



const masailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    sl: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    
  },
  { timestamps: true },
);

export default mongoose.model("Masail", masailSchema);
