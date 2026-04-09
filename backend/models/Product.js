const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      // Keep legacy values for backward compatibility with any existing docs,
      // but the UI should only expose the 7 "official" categories.
      enum: [
        'books',
        'electronics',
        'cycles',
        'club_merchandise',
        'gym_equipments',
        'clothing',
        'miscellaneous',
        // legacy
        'room_essentials',
        'other',
      ],
    },
    condition: {
      type: String,
      required: [true, 'Please specify the condition'],
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one image'],
    },
    sellerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    location: {
      type: String,
      default: 'Campus',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
