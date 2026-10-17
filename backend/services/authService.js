import User from "../models/User.js";
import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * All common formats of the same Bangladeshi number:
 * "01924301474" | "8801924301474" | "+8801924301474"
 */
const phoneVariants = (phone) => {
  const raw = String(phone || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return [raw];

  let local = digits;
  if (local.startsWith("880")) local = local.slice(2); // 8801XXXXXXXXX -> 01XXXXXXXXX
  else if (local.length === 10) local = `0${local}`; // 1XXXXXXXXX -> 01XXXXXXXXX

  return Array.from(new Set([raw, local, `88${local}`, `+88${local}`]));
};

/**
 * Finds the user for a phone number regardless of format. If duplicate
 * accounts exist (web saved "01...", app saved "+880..."), prefer the one
 * that has a name, then the oldest one, so web and app share one account.
 */
const findUserByPhone = async (phone) => {
  const users = await User.find({ phone: { $in: phoneVariants(phone) } });
  if (!users.length) return null;

  users.sort((a, b) => {
    const aNamed = a.name ? 1 : 0;
    const bNamed = b.name ? 1 : 0;
    if (aNamed !== bNamed) return bNamed - aNamed;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });
  return users[0];
};

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
});

const signIn = async (phone) => {
  let user = await findUserByPhone(phone);

  if (!user) {
    user = await User.create({ phone });
  }
  const otp = "1234";
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await user.save();
  return { phone: user.phone, otp };
};

const verifyOtp = async (phone, otp) => {
  const user = await findUserByPhone(phone);
  if (!user || !user.otp || !user.otpExpiresAt)
    return {
      message: "Invalid or expired OTP",
    };

  const now = new Date();
  if (user.otp !== otp || user.otpExpiresAt < now)
    return {
      message: "Invalid or expired OTP",
    };

  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn },
  );

  return { user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role }, token };
};

// Email/Password Authentication
const emailSignIn = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return { success: false, message: 'Invalid email or password' };
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn },
  );

  return {
    success: true,
    user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
    token,
  };
};

const createAdmin = async (email, password) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { success: false, message: 'Email already registered' };
  }

  const user = new User({
    email,
    password,
    role: 'admin',
  });

  await user.save();
  return {
    success: true,
    user: { id: user._id, email: user.email, role: user.role },
    message: 'Admin user created successfully',
  };
};

/** Fresh user profile from DB (used by GET /auth/me). */
const getMe = async (tokenUser) => {
  if (!tokenUser) return null;
  let user = tokenUser.phone ? await findUserByPhone(tokenUser.phone) : null;
  if (!user && tokenUser.id) user = await User.findById(tokenUser.id);
  return user ? toPublicUser(user) : null;
};

export { signIn, verifyOtp, emailSignIn, createAdmin, getMe, findUserByPhone, phoneVariants };

