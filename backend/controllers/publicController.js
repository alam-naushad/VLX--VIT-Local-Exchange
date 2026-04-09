const Product = require('../models/Product');
const User = require('../models/User');

exports.getPublicStats = async (req, res) => {
  try {
    const [verifiedUsers, totalUsers, availableListings] = await Promise.all([
      User.countDocuments({ isVerified: true }),
      User.countDocuments({}),
      Product.countDocuments({ status: 'available' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        verifiedUsers,
        totalUsers,
        availableListings,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load public stats' });
  }
};

