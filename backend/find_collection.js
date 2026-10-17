import mongoose from "mongoose";
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const doc = await mongoose.connection.db.collection(c.name).findOne({ funds: { $exists: true }, quickAmounts: { $exists: true } });
    if (doc) {
      console.log("FOUND IN COLLECTION:", c.name);
      process.exit(0);
    }
  }
  console.log("NOT FOUND");
  process.exit(0);
});
