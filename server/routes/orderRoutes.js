const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, requireAdmin, orderController.getOrders);
router.post('/', orderController.createOrder); // Public for customer checkout
router.put('/:id', verifyToken, requireAdmin, orderController.updateOrderStatus);
router.delete('/:id', verifyToken, requireAdmin, orderController.deleteOrder);

module.exports = router;
