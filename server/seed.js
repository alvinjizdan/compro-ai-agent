const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { sequelize, User, Product } = require('./database');
const KnowledgeBase = require('./models/KnowledgeBase');


const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://mongo_db:27017/radhika_pos_db';
    await mongoose.connect(mongoUri);
    
    await KnowledgeBase.deleteMany({});
    // 1. Reset Database (Hapus data lama biar gak dobel saat ditest ulang)
    await sequelize.sync({ force: true });
    console.log('🗑️ Database lama bersihkan...');

    // 2. Bikin Akun ADMIN
    const passwordAdmin = await bcrypt.hash('***REMOVED***', 10); // Password: ***REMOVED***
    await User.create({
      username: 'admin',
      password: passwordAdmin,
      role: 'ADMIN'
    });
    console.log('👤 Akun ADMIN berhasil dibuat! (User: admin, Pass: ***REMOVED***)');

    // 3. Bikin Akun USER Biasa (untuk tes)
    const passwordUser = await bcrypt.hash('user123', 10);
    await User.create({
      username: 'budi',
      password: passwordUser,
      role: 'USER'
    });
    console.log('👤 Akun USER berhasil dibuat! (User: budi, Pass: user123)');

    // 4. Masukkan Data Produk (Sesuai diskusi sebelumnya)
    await Product.bulkCreate([
      {
        name: "Kelapa Cungkil",
        category: "Bahan Baku",
        price: 11000,
        stock: 500, // Stok awal 500 kg
        image: "https://images.unsplash.com/photo-1623168673826-66f8e7529463?q=80&w=800&auto=format&fit=crop",
        description: "Daging kelapa segar berkualitas yang telah dicungkil dari batoknya."
      },
      {
        name: "Kopra Asongan",
        category: "Kopra",
        price: 12000,
        stock: 200,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuj9qM-a_q1OpK6Q5J8ZkSgTqRuy_q3XGZKg&s",
        description: "Kopra hasil petani dengan kadar air medium."
      },
      {
        name: "Kopra Regular",
        category: "Kopra",
        price: 13000,
        stock: 1000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6lE0rE5-sO5tM4R0QzX8_wXjT5_k9VqLz4w&s",
        description: "Kopra kering kualitas pabrik (Mill Grade) kadar air rendah."
      },
      {
        name: "Kelapa Buah",
        category: "Kelapa Butir",
        price: 14000,
        stock: 300,
        image: "https://images.unsplash.com/photo-1599525166299-d48e029c786a?q=80&w=800&auto=format&fit=crop",
        description: "Kelapa butir utuh (whole coconut) pilihan ekspor."
      }
    ]);
    console.log('🥥 Data Produk berhasil dimasukkan!');

  } catch (error) {
    console.error('❌ Gagal seeding:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();