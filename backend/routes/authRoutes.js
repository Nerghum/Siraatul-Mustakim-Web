import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authService from '../services/authService.js';
import { protect } from '../middleware/auth.js';
import { protectAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/signin', authController.signIn);
router.post('/verify-otp', authController.verifyOtp);

router.post('/login', authController.emailLogin);
router.post('/create-admin', protectAdmin, authController.createAdmin);


router.get('/me', protect, async (req, res) => {
  try {
    const user = await authService.getMe(req.user);
    res.json({ user: user || req.user });
  } catch {
    res.json({ user: req.user });
  }
});

export default router;
