import mongoose from "mongoose";
import "dotenv/config";

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/siraatul-mustakim").then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(collections.map(c => c.name));
  process.exit(0);
});
