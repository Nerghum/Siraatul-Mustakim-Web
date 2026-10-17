#!/usr/bin/env node

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/createAdmin.js <email> <password>');
  console.error('\nExample: node scripts/createAdmin.js admin@example.com myPassword123');
  process.exit(1);
}

const [email, password] = args;

// Validate inputs
if (!email.includes('@')) {
  console.error('Error: Invalid email format');
  process.exit(1);
}

if (password.length < 6) {
  console.error('Error: Password must be at least 6 characters');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('Error: Email already registered');
      process.exit(1);
    }

    // Create admin user
    const user = new User({
      email,
      password,
      role: 'admin',
    });

    await user.save();
    console.log('✓ Admin user created successfully');
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  ID: ${user._id}`);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
