import * as authService from '../services/authService.js';

const signIn = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number required' });
  }

  const result = await authService.signIn(phone);
  console.log('OTP sign-in result:', result);
  res.status(200).json({
    message: 'OTP sent to phone number',
    ...result,
  });
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  console.log('Verifying OTP for phone:', phone, 'with OTP:', otp);
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP required' });
  }

  const result = await authService.verifyOtp(phone, otp);
  if (!result) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  res.json(result);
};

// Email/Password Login
const emailLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const result = await authService.emailSignIn(email, password);
  
  if (!result.success) {
    return res.status(401).json({ message: result.message });
  }

  res.status(200).json({
    message: 'Login successful',
    user: result.user,
    token: result.token,
  });
};

// Create Admin User
const createAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const result = await authService.createAdmin(email, password);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(201).json(result);
};

export { signIn, verifyOtp, emailLogin, createAdmin };

