const express = require('express');
const {
  listUsers,
  setUserBan,
  listProducts,
  deleteProductAsAdmin,
  listReports,
  updateReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, adminOnly, listUsers);
router.put('/users/:id/ban', protect, adminOnly, setUserBan);

router.get('/products', protect, adminOnly, listProducts);
router.delete('/products/:id', protect, adminOnly, deleteProductAsAdmin);

router.get('/reports', protect, adminOnly, listReports);
router.put('/reports/:id', protect, adminOnly, updateReport);

module.exports = router;

