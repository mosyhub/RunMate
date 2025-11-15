const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  deleteProductPhoto
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../utils/cloudinary');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Protected routes (require authentication)
router.post('/', protect, uploadMultiple.array('photos', 10), createProduct);
router.put('/:id', protect, uploadMultiple.array('photos', 10), updateProduct);
router.delete('/:id', protect, deleteProduct);
router.delete('/:id/photo', protect, deleteProductPhoto);

module.exports = router;

