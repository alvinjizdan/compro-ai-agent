const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.error("❌ Gagal: ADMIN_USERNAME, ADMIN_EMAIL, dan ADMIN_PASSWORD harus diset di .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skripsi-pos-chatbot');

        const adminExists = await User.findOne({ 
            $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }] 
        });

        if (adminExists) {
            console.log("ℹ️ Admin sudah ada. Tidak menimpa kredensial lama untuk keamanan.");
            process.exit(0);
        }

        await User.create({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'ADMIN'
        });

        console.log("✅ Akun Admin berhasil dibuat dengan aman.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Terjadi kesalahan saat seed admin:", error.message);
        process.exit(1);
    }
};

seedAdmin();
