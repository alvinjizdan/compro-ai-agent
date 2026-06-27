const express = require('express');
const router = express.Router();

const { adminLogin } = require('../controllers/authController');
const { processAdminChat } = require('../controllers/adminChatController');
const authMiddleware = require('../middleware/authMiddleware');

// Route khusus untuk Login Admin
// Terbuka untuk diakses, namun di dalamnya akan ditolak jika role !== 'ADMIN'
router.post('/login', adminLogin);

// Route khusus untuk Agen Chatbot Admin
// Dilindungi oleh Middleware: Wajib bawa Token JWT berstatus 'ADMIN'
router.post('/chat', authMiddleware, processAdminChat);

module.exports = router;
