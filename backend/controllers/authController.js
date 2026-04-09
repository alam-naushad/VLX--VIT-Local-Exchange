const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const isVitStudentEmail = (email) => /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/.test(String(email || '').trim());
const generateOtp6 = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user & send OTP
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!isVitStudentEmail(email)) {
      return res.status(400).json({ message: 'Please use a valid @vitstudent.ac.in email address' });
    }

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ message: 'Email service not configured. Please set EMAIL_USERNAME and EMAIL_PASSWORD.' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (unverified)
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role:
        process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === String(email).toLowerCase()
          ? 'admin'
          : 'user',
    });

    // Generate random 6-digit OTP
    const otp = generateOtp6();

    // Save OTP to db
    await VerificationToken.create({
      userId: user._id,
      token: otp,
    });

    // Always log OTP for development convenience
    console.log(`\n=================================================`);
    console.log(`   OTP GENERATED FOR: ${email}   `);
    console.log(`   OTP CODE: ${otp}   `);
    console.log(`=================================================\n`);

    // Send email
    const message = `Welcome to VLX Marketplace! \n\nYour email verification code is: ${otp}\nThis code will expire in 1 hour.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email to Join VLX',
        message,
      });
    } catch (err) {
      // Roll back so we don't create accounts that never received OTP
      await VerificationToken.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
      return res.status(502).json({ message: 'Failed to send OTP email. Please try again in a minute.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP (for unverified user)
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isVitStudentEmail(email)) {
      return res.status(400).json({ message: 'Please use a valid @vitstudent.ac.in email address' });
    }

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ message: 'Email service not configured. Please set EMAIL_USERNAME and EMAIL_PASSWORD.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });

    // Replace any previous OTPs
    await VerificationToken.deleteMany({ userId: user._id });

    const otp = generateOtp6();
    await VerificationToken.create({ userId: user._id, token: otp });

    console.log(`\n=================================================`);
    console.log(`   OTP RE-SENT FOR: ${email}   `);
    console.log(`   OTP CODE: ${otp}   `);
    console.log(`=================================================\n`);

    const message = `Your VLX Marketplace email verification code is: ${otp}\nThis code will expire in 1 hour.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your VLX Verification Code',
        message,
      });
    } catch {
      return res.status(502).json({ message: 'Failed to resend OTP email. Please try again in a minute.' });
    }

    return res.status(200).json({ success: true, message: 'OTP resent. Please check your email.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: otp,
    });

    if (!verificationToken) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Delete token
    await VerificationToken.deleteOne({ _id: verificationToken._id });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        college: user.college,
        year: user.year,
        whatsappNumber: user.whatsappNumber,
        role: user.role,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first', unverified: true });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        college: user.college,
        year: user.year,
        whatsappNumber: user.whatsappNumber,
        isVerified: user.isVerified,
        role: user.role,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const allowed = ['name', 'year', 'whatsappNumber', 'profileImage'];
    const updates = {};

    allowed.forEach((k) => {
      if (typeof req.body[k] !== 'undefined') updates[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
