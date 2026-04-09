const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt').select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setUserBan = async (req, res) => {
  try {
    const { banned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: !!banned },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort('-createdAt')
      .populate({ path: 'sellerId', select: 'name email role isBanned' });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProductAsAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await Product.deleteOne({ _id: product._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort('-createdAt')
      .populate({ path: 'reporterId', select: 'name email' })
      .populate({ path: 'productId', select: 'title price status' });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const update = {};
    if (status) update.status = status;
    if (typeof adminNote !== 'undefined') update.adminNote = adminNote;

    if (status === 'resolved' || status === 'rejected') {
      update.resolvedBy = req.user.id;
      update.resolvedAt = new Date();
    }

    const report = await Report.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate({ path: 'reporterId', select: 'name email' })
      .populate({ path: 'productId', select: 'title price status' });

    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

