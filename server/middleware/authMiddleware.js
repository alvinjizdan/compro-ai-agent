const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Akses Ditolak: Token tidak ditemukan atau format salah" });
        }

        const token = authHeader.split(' ')[1];
        const SECRET_KEY = process.env.SECRET_KEY; 
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Akses Ditolak: Anda bukan Admin" });
        }

        next(); // Lanjut ke controller
    } catch (error) {
        return res.status(401).json({ error: "Akses Ditolak: Token tidak valid atau sudah kadaluarsa" });
    }
};

module.exports = authMiddleware;
