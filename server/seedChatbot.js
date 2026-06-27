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

const seedChatbotDB = async () => {
  try {
    // Pastikan URL database ini sama dengan yang ada di index.js Anda
    await mongoose.connect('mongodb://127.0.0.1:27017/radhika_pos_db');
    
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