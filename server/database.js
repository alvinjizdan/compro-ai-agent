const { Sequelize, DataTypes } = require('sequelize');

// Setup SQLite Database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database_toko.sqlite', // File database akan muncul di folder server
  logging: false // Matikan log SQL biar terminal bersih
});

// 1. MODEL USER (Admin & Customer)
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "USER" } // "ADMIN" atau "USER"
});

// 2. MODEL PRODUCT (Barang Dagangan)
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true, defaultValue: "" }, // Deskripsi
  image: { type: DataTypes.STRING, allowNull: true }
});

// 3. MODEL ORDER (Rekap Pesanan)
const Order = sequelize.define('Order', {
  customerName: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.TEXT, allowNull: false }, // Disimpan sebagai JSON String
  totalPrice: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "Menunggu Konfirmasi" },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Fungsi Koneksi & Sinkronisasi Tabel
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // 'alter: true' akan otomatis update kolom tabel tanpa hapus data
    await sequelize.sync({ alter: true }); 
    console.log('Database SQLite Berhasil Terkoneksi (via Sequelize)!');
  } catch (error) {
    console.error('Gagal koneksi database:', error);
  }
};

// 👇 BAGIAN INI SANGAT PENTING (JANGAN LUPA EXPORT ORDER)
module.exports = { connectDB, User, Product, Order };