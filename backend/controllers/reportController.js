const Report = require('../models/Report');
const Product = require('../models/Product');

// @desc    Create a report for a product
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { productId, reason } = req.body;

    if (!productId) return res.status(400).json({ message: 'productId is required' });
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return res.status(400).json({ message: 'reason is required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const report = await Report.create({
      reporterId: req.user.id,
      productId,
      reason: reason.trim(),
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

