const mongoose = require('mongoose');
// Sesuaikan letak folder models Anda jika berbeda
const KnowledgeBase = require('./models/KnowledgeBase'); 

const seedData = [
  {
    question: "berapa harga kopra hari ini",
    answer: "Untuk saat ini, harga kopra di PT Radhika Narya Daruna adalah Rp. 15.000/kg."
  },
  {
    question: "bagaimana cara pesan order beli barang",
    answer: "Anda bisa memesan langsung melalui fitur keranjang di website ini atau menghubungi admin via WhatsApp di nomor resmi perusahaan."
  },
  {
    question: "apa itu kelapa cungkil",
    answer: "Kelapa cungkil adalah daging kelapa yang sudah dilepaskan dari tempurungnya tanpa menggunakan air, biasanya digunakan sebagai bahan baku kopra putih."
  }
];

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedChatbotDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://mongo_db:27017/radhika_pos_db';
    await mongoose.connect(mongoURI);
    
    // Hapus data lama dan masukkan data baru
    await KnowledgeBase.deleteMany({});
    await KnowledgeBase.insertMany(seedData);
    
    console.log("✅ Database Mongoose untuk Chatbot berhasil diisi!");
    process.exit();
  } catch (err) {
    console.error("❌ Gagal seeding Mongoose:", err);
    process.exit(1);
  }
};

seedChatbotDB();