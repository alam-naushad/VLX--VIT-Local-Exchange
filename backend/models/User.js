const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@vitstudent\.ac\.in$/,
        'Please use a valid @vitstudent.ac.in email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    college: {
      type: String,
      default: 'VIT',
    },
    profileImage: {
      type: String,
      default: 'default.jpg',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    year: {
      type: String,
      default: '',
      trim: true,
      maxlength: 32,
    },
    whatsappNumber: {
      type: String,
      default: '',
      trim: true,
      maxlength: 32,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
