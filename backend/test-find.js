import mongoose from 'mongoose';
import { findUserByPhone } from './services/authService.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await findUserByPhone('+8801924301474');
  console.log("findUserByPhone +880... :", JSON.stringify(result));
  
  const result2 = await findUserByPhone('01924301474');
  console.log("findUserByPhone 0192... :", JSON.stringify(result2));
  
  process.exit(0);
});
