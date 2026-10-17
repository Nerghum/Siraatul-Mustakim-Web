import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import jwtConfig from './config/jwt.js';
import User from './models/User.js';
import { getMe } from './services/authService.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Find the empty user
  const user = await User.findOne({ phone: '+8801924301474' });
  if (!user) {
    console.log("Empty user not found!");
    process.exit(1);
  }
  console.log("Empty User ID:", user._id);
  
  // Create old token for empty user
  const token = jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
  
  // Decode the token (just like auth.js middleware does)
  const decoded = jwt.verify(token, jwtConfig.secret);
  
  // Call getMe just like /auth/me does
  const me = await getMe(decoded);
  console.log("getMe Result:", JSON.stringify(me));
  
  process.exit(0);
});
