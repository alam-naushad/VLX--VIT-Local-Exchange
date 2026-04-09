const Product = require('../models/Product');

// @desc    Get category stats for landing page
// @route   GET /api/products/category-stats
// @access  Public
exports.getCategoryStats = async (req, res) => {
  try {
    const pipeline = [
      { $match: { status: 'available' } },
      { $sort: { createdAt: -1 } },
      // Normalize legacy categories into the 7 official ones
      {
        $addFields: {
          categoryNormalized: {
            $switch: {
              branches: [
                { case: { $eq: ['$category', 'other'] }, then: 'miscellaneous' },
                { case: { $eq: ['$category', 'room_essentials'] }, then: 'miscellaneous' },
              ],
              default: '$category',
            },
          },
        },
      },
      {
        $group: {
          _id: '$categoryNormalized',
          count: { $sum: 1 },
          coverImages: { $first: '$images' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          coverImage: { $arrayElemAt: ['$coverImages', 0] },
        },
      },
    ];

    const stats = await Product.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load category stats' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    const baseFilter = JSON.parse(queryStr);
    const filter = { ...baseFilter };

    if (req.query.search && typeof req.query.search === 'string') {
      const search = req.query.search.trim();
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }
    }

    // Finding resource
    query = Product.find(filter).populate({
      path: 'sellerId',
      select: 'name college profileImage rating whatsappNumber',
    });

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(filter);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: 'sellerId',
      select: 'name college profileImage rating reviewsCount whatsappNumber',
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    // Add user to req.body
    req.body.sellerId = req.user.id;

    // Handle uploaded images from multer-storage-cloudinary
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => file.path);
    } else {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    // Tags usually come as a comma-separated string, convert to array if so
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((tag) => tag.trim());
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is product owner or admin
    if (product.sellerId.toString() !== req.user.id) {
       // Allow if we introduce an admin role later: && req.user.role !== 'admin'
      return res.status(403).json({ message: 'User not authorized to update this product' });
    }

    // Handle new images if any are uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      // Append or replace depending on your requirement. Let's say append:
      req.body.images = [...product.images, ...newImages];
    }
    
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map((tag) => tag.trim());
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure user is product owner or admin
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: product._id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's products
// @route   GET /api/products/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
