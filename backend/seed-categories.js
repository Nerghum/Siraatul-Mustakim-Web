import mongoose from "mongoose";

const masailCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const MasailCategory = mongoose.models.MasailCategory || mongoose.model("MasailCategory", masailCategorySchema);

const categories = [
  { name: "ঈমান", slug: "iman" },
  { name: "নামাজ", slug: "namaz" },
  { name: "রোজা", slug: "roza" },
  { name: "হজ্জ", slug: "hajj" },
  { name: "যাকাত", slug: "zakat" },
  { name: "মুআ'মালাত", slug: "muamalat" },
  { name: "মুআ'শারাত", slug: "muasharat" },
  { name: "আখলাক", slug: "akhlaq" },
  { name: "দাওয়াত ও তাবলীগ", slug: "dawat-tabligh" },
  { name: "তাসকিয়াহ", slug: "islah" },
  { name: "আকিদা", slug: "aqida" },
  { name: "বিবাহ ও শাদী", slug: "biye" }
];

async function seed() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/siraatul-mustakim");
    for (const cat of categories) {
      await MasailCategory.findOneAndUpdate(
        { slug: cat.slug },
        { name: cat.name },
        { upsert: true, new: true }
      );
    }
    console.log("Seeded categories successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}
seed();
