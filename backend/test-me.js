import mongoose from 'mongoose';
import { getMe } from './services/authService.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await getMe({ phone: '+8801924301474' });
  console.log(JSON.stringify(result));
  process.exit(0);
});
