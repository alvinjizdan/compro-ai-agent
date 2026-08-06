const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.post('/', verifyToken, requireAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);

module.exports = router;
