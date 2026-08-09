const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 30, // 30 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Terlalu banyak request. Silakan coba lagi nanti." }
});

module.exports = { aiLimiter };
