
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';

const adminOnly = (req, res, next) => {
  console.log(req);
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
};

const protectAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const muftiOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (req.user.role !== "mufti") {
    return res.status(403).json({ message: "Forbidden: Mufti access required" });
  }

  next();
};

const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const allowedRoles = ["admin", "moderator", "mufti"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Staff access required" });
  }

  next();
};

const protectMufti = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (decoded.role !== 'mufti') {
      return res.status(403).json({ message: 'Forbidden: Mufti access required' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export { adminOnly, protectAdmin, muftiOnly, staffOnly, protectMufti };
