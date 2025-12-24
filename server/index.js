const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto')

// Import database
const { sequelize, User, Product, Order } = require('./database');

const app = express();
const SECRET_KEY = "rahasia_negara_api_key"; 

const nodemailer = require('nodemailer'); // 👈 Pastikan sudah install: npm install nodemailer

// 👇 KONFIGURASI GMAIL (Ganti dengan App Password Anda)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jizdan.a14@gmail.com', // ⚠️ GANTI EMAIL ASLI ANDA
    pass: 'sfwe sxik lqlc njkp'   // ⚠️ GANTI 16 DIGIT APP PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

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

// ==========================================
// 🔐 API OTENTIKASI
// ==========================================
app.post('/api/register', async (req, res) => {
  // 👇 Terima parameter email dari Frontend
  const { username, email, password, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // 👇 Simpan email ke database
    const user = await User.create({ 
      username, 
      email, 
      password: hashedPassword, 
      role: "USER" 
    });
    res.json({ message: "User berhasil dibuat!", user });
  } catch (error) { 
    console.error(error);
    res.status(400).json({ error: "Username atau Email sudah terdaftar" }); 
  }
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

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: "Username tidak ditemukan" });
    }

    // Cek apakah user punya email (jaga-jaga data lama)
    if (!user.email) {
      return res.status(400).json({ error: "Akun ini tidak memiliki email terdaftar." });
    }

    // Buat Token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 jam
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // 2. EKSEKUSI RESET (VERSI LEBIH STABIL & DETAIL)
app.post('/api/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log(`Menerima request reset untuk token: ${token}`);

    // 1. Cari user berdasarkan token SAJA dulu (jangan cek waktu dulu)
    const user = await User.findOne({ where: { resetToken: token } });

    // 2. Cek apakah user ketemu?
    if (!user) {
      console.log("❌ Gagal: Token tidak ditemukan di database (Mungkin sudah ditimpa token baru)");
      return res.status(400).json({ error: "Token tidak valid (Mungkin Anda minta reset 2x? Pakai email terbaru)" });
    }

    // 3. Cek apakah token sudah kadaluarsa? (Cek manual pakai Javascript)
    const now = new Date();
    if (user.resetTokenExpiry < now) {
      console.log("❌ Gagal: Token sudah kadaluarsa");
      return res.status(400).json({ error: "Token sudah kadaluarsa, silakan minta link baru" });
    }

    // 4. Jika lolos semua, Hash Password Baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 5. Simpan & Hapus Token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    console.log(`✅ Sukses: Password untuk ${user.username} berhasil diubah!`);
    res.json({ message: "Password berhasil diubah! Silakan login." });

  } catch (error) {
    console.error("Server Error saat Reset:", error);
    res.status(500).json({ error: "Gagal memproses di sisi server" });
  }
});

    // KIRIM EMAIL ASLI
    const mailOptions = {
      from: '"Admin PT Radhika Narya Daruna" <no-reply@tokoanda.com>',
      to: user.email, // Kirim ke email user yang ada di database
      subject: 'Permintaan Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #333333; text-align: center;">Permintaan Reset Password</h2>
      <p style="font-size: 16px; color: #555555;">Halo <b>${user.username}</b>,</p>
      <p style="font-size: 14px; color: #555555; line-height: 1.5;">
        Kami menerima permintaan untuk mereset password akun Anda. Silakan klik tombol biru di bawah ini untuk membuat password baru:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #007BFF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
          Reset Password Sekarang
        </a>
      </div>
      <p style="font-size: 12px; color: #999999; text-align: center;">
        Link ini hanya berlaku selama 1 jam. Jika tombol di atas tidak berfungsi, copy link ini ke browser Anda:
      </p>
      <p style="font-size: 10px; color: #aaaaaa; text-align: center; word-break: break-all;">
        ${resetLink}
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
      <p style="font-size: 10px; color: #bbbbbb; text-align: center;">
        Jika Anda tidak merasa meminta reset password, abaikan email ini.
      </p>
    </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email reset terkirim ke: ${user.email}`);
    
    res.json({ message: `Link reset telah dikirim ke email ${user.email}` });

  } catch (error) {
    console.error("Gagal kirim email:", error);
    res.status(500).json({ error: "Gagal mengirim email. Cek server." });
  }
});

// API PRODUK (CRUD)

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
const PORT = 5000;

// 1. Sinkronisasi Database Dulu (WAJIB ADA)
sequelize.sync().then(async () => { 
  console.log('✅ Database SQLite Berhasil Terkoneksi & Sinkron!');

  // 2. Cek & Buat Admin Otomatis
  try {
    const adminUsername = "admin";
    
    // Cek apakah admin sudah ada?
    const adminCheck = await User.findOne({ where: { username: adminUsername } });

    if (!adminCheck) {
      // Jika belum ada, buat baru
      const adminHash = await bcrypt.hash("***REMOVED***", 10);
      await User.create({
        username: adminUsername,
        email: "admin@toko.com",
        password: adminHash,
        role: "ADMIN" // 👑 Role Khusus Admin
      });
      console.log("\n========================================");
      console.log("AKUN ADMIN BERHASIL DIBUAT OTOMATIS!");
      console.log("Username: admin");
      console.log("Password: ***REMOVED***");
      console.log("========================================\n");
    } else {
      console.log("Akun admin sudah tersedia.");
    }
  } catch (error) {
    console.error("Gagal membuat admin otomatis:", error);
  }

  // 3. Baru Jalankan Server (Setelah DB Siap)
  app.listen(PORT, () => {
    console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
  });

}).catch(err => {
  console.error('Gagal koneksi database:', err);
});