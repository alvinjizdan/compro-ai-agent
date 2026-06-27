const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const { processChatMessage } = require('./controllers/chatbotController');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// DB & Models
const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 2. VARIABEL LINGKUNGAN & KONEKSI DB
// ==========================================
const PORT = process.env.PORT || 5000;
connectDB();

// ==========================================
// 3. ROUTER
// ==========================================
app.post('/api/chat', processChatMessage);
app.use('/api/admin', adminRoutes);
app.use('/api/', authRoutes); // /register, /login, /forgot-password, /reset-password
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// ==========================================
// 4. SERVER START & ADMIN CHECK
// ==========================================
const createAdminAccount = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'admin',
                email: 'admin@toko.com',
                password: '***REMOVED***', 
                role: 'ADMIN'
            });
            console.log("✅ Admin Created: admin / ***REMOVED***");
        }
    } catch (error) {
        console.error("Gagal buat admin:", error.message);
    }
};

app.listen(PORT, async () => {
  await createAdminAccount();
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});