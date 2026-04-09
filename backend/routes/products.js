const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyListings,
  getCategoryStats,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Define specific routes first so they don't get caught by /:id
router.get('/my-listings', protect, getMyListings);
router.get('/category-stats', getCategoryStats);

router
  .route('/')
  .get(getProducts)
  .post(protect, upload.array('images', 5), createProduct); // Up to 5 images

router
  .route('/:id')
  .get(getProduct)
  .put(protect, upload.array('images', 5), updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
