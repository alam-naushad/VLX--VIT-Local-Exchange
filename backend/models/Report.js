const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason'],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'rejected'],
      default: 'open',
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

