const express = require('express');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { register, resendOtp, verifyEmail, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const otpKeyGenerator = (req) => {
  const email = (req.body?.email || '').toString().trim().toLowerCase();
  return `${ipKeyGenerator(req)}:${email || 'no-email'}`;
};

const otpLimit30s = rateLimit({
  windowMs: 30 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Please wait 30 seconds before requesting another OTP.' },
  keyGenerator: otpKeyGenerator,
});

const otpLimit10m = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please try again after 10 minutes.' },
  keyGenerator: otpKeyGenerator,
});

const loginLimit10m = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

router.post('/register', otpLimit30s, otpLimit10m, register);
router.post('/resend-otp', otpLimit30s, otpLimit10m, resendOtp);
router.post('/verify', verifyEmail);
router.post('/login', loginLimit10m, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
