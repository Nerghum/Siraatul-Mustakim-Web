import status from "http-status";
import mongoose from "mongoose";
import User from "../models/User.js";

const createUser = async (req, res) => {
  const { name, phone, email, password, role } = req.body;

  if (!phone) {
    return res.status(status.BAD_REQUEST).json({ error: "Phone number is required" });
  }
  if (password && password.length < 6) {
    return res.status(status.BAD_REQUEST).json({ error: "Password must be at least 6 characters" });
  }

  const allowedRoles = ["user", "writer", "admin", "moderator", "mufti"];
  const userRole = role && allowedRoles.includes(role) ? role : "user";

  try {
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(status.BAD_REQUEST).json({ error: "Email already in use" });
      }
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(status.BAD_REQUEST).json({ error: "Phone number already in use" });
    }

    const userData = {
      name: name || "",
      phone,
      role: userRole,
    };
    if (email) userData.email = email;
    if (password) userData.password = password;

    const user = await User.create(userData);

    const result = user.toObject();
    delete result.password;
    delete result.otp;
    delete result.otpExpiresAt;

    res.status(status.CREATED).json(result);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const q = String(req.query?.q ?? "").trim();
    const role = String(req.query?.role ?? "").trim();
    const page = Math.max(1, parseInt(req.query?.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query?.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    if (role && ["user", "writer", "admin", "moderator", "mufti"].includes(role)) {
      filter.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ role: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const normalized = users.map((u) => ({
      ...u,
      role: u.role || "user",
    }));

    res.status(status.OK).json({
      data: normalized,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }
  try {
    const user = await User.findById(id).lean();
    if (!user) return res.status(status.NOT_FOUND).json({ error: "User not found" });
    res.status(status.OK).json({ ...user, role: user.role || "user" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }

  const { name, email, password, role } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (role !== undefined) {
    if (req.user.role !== "admin") {
      return res.status(status.FORBIDDEN).json({ error: "Only admin can change roles" });
    }
    if (!["user", "writer", "admin", "moderator", "mufti"].includes(role)) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid role" });
    }
    updates.role = role;
  }

  try {
    let user = await User.findById(id);
    if (!user) return res.status(status.NOT_FOUND).json({ error: "User not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(status.BAD_REQUEST).json({ error: "Email already in use" });
      }
    }

    Object.assign(user, updates);

    if (password) {
      user.password = password;
    }

    await user.save();

    const result = user.toObject();
    delete result.password;
    delete result.otp;
    delete result.otpExpiresAt;
    result.role = result.role || "user";

    res.status(status.OK).json(result);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }

  if (req.user.id === id) {
    return res.status(status.BAD_REQUEST).json({ error: "Cannot delete yourself" });
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(status.NOT_FOUND).json({ error: "User not found" });
    res.status(status.OK).json({ message: "User deleted" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getUserStats = async (_req, res) => {
  try {
    const [total, adminCount, moderatorCount, muftiCount, userCount, writerCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "moderator" }),
      User.countDocuments({ role: "mufti" }),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "writer" }),
    ]);
    res.status(status.OK).json({ total, admin: adminCount, moderator: moderatorCount, mufti: muftiCount, user: userCount, writer: writerCount });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserStats };
