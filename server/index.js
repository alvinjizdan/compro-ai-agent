const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Import database
const { connectDB, User, Product, Order } = require('./database');

const app = express();
const PORT = 5000;
const SECRET_KEY = "rahasia_negara_api_key"; 

// Middleware
app.use(cors());
app.use(express.json());

// ⚠️ Agar folder uploads bisa diakses browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📂 Konfigurasi Multer (Simpan Gambar)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pastikan folder 'uploads' ada!
  },
  filename: (req, file, cb) => {
    // Nama file: timestamp + ekstensi asli
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });

// Jalankan Koneksi Database
connectDB();

// ==========================================
// 🔐 API OTENTIKASI
// ==========================================
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hashedPassword, role: role || "USER" });
    res.json({ message: "User berhasil dibuat!", user });
  } catch (error) { res.status(400).json({ error: "Username error" }); }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Password salah" });
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: "Login sukses", token, role: user.role, username: user.username });
});

// ==========================================
// 📦 API PRODUK (CRUD)
// ==========================================

// 1. LIHAT SEMUA PRODUK
app.get('/api/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// 2. TAMBAH PRODUK (Upload Gambar + Deskripsi)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    
    // Cek ada gambar atau tidak
    const imageUrl = req.file 
      ? `http://localhost:5000/uploads/${req.file.filename}` 
      : 'https://via.placeholder.com/150';

    const newProduct = await Product.create({
      name,
      category,
      price,
      stock,
      description, // Simpan deskripsi
      image: imageUrl
    });

    res.json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal tambah produk" });
  }
});

// 3. EDIT PRODUK
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    product.name = name;
    product.category = category;
    product.price = price;
    product.stock = stock;
    product.description = description;

    // Jika ada gambar baru, update. Jika tidak, pakai yang lama.
    if (req.file) {
      product.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Gagal update produk" });
  }
});

// 4. HAPUS PRODUK
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });
    await product.destroy();
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus produk" });
  }
});


// API ORDER / TRANSAKSI

// 1. SIMPAN ORDER BARU
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, items, totalPrice } = req.body;
    
    const newOrder = await Order.create({
      customerName,
      items: JSON.stringify(items), 
      totalPrice
    });

    res.json({ message: "Order berhasil dicatat", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mencatat order" });
  }
});

// 2. AMBIL SEMUA ORDER (Rekap)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data order" });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Status baru dikirim dari frontend
    
    // Update status di database
    await Order.update({ status }, { where: { id } });
    
    res.json({ message: "Status berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal update status" });
  }
});

// 4. HAPUS PESANAN
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.destroy({ where: { id } });
    res.json({ message: "Pesanan berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal hapus pesanan" });
  }
});

// API MANAJEMEN PENGGUNA

// 1. AMBIL SEMUA USER (Tanpa Password)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // 👈 PENTING: Jangan kirim password ke frontend!
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil data user" });
  }
});

// 2. GANTI ROLE (User <-> Admin)
app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'ADMIN' atau 'USER'
    
    await User.update({ role }, { where: { id } });
    res.json({ message: "Role berhasil diubah" });
  } catch (error) {
    res.status(500).json({ error: "Gagal update role" });
  }
});

// 3. HAPUS USER
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus user" });
  }
});

// JALANKAN SERVER (INI YANG HILANG TADI)
app.listen(PORT, () => {
  console.log(`Server Backend berjalan di http://localhost:${PORT} 🚀`);
});