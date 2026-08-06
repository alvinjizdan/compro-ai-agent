const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Akses Ditolak: Token tidak ditemukan atau format salah" });
        }

        const token = authHeader.split(' ')[1];
        const SECRET_KEY = process.env.SECRET_KEY; 
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;
        next(); // Lanjut tanpa memaksa role ADMIN
    } catch (error) {
        return res.status(401).json({ error: "Akses Ditolak: Token tidak valid atau sudah kadaluarsa" });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Akses Ditolak: Anda bukan Admin" });
    }
    next();
};

// Legacy middleware function for backward compatibility
// Maintains the exact same behavior for routes that currently import authMiddleware directly
const authMiddleware = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);
        if (res.headersSent) return; // Jika verifyToken gagal dan mengirim respon 401
        requireAdmin(req, res, next);
    });
};

module.exports = authMiddleware;
module.exports.verifyToken = verifyToken;
module.exports.requireAdmin = requireAdmin;
