const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const SECRET_KEY = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS   
  },
  tls: { rejectUnauthorized: false }
});

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ error: "Username atau Email sudah terdaftar" });

    const user = await User.create({ 
      username,
      email, 
      password,
      role: "USER" 
    });

    res.json({ message: "User berhasil dibuat!", userId: user._id });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ message: "Login sukses", token, role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    if (user.role !== 'ADMIN') return res.status(403).json({ error: "Akses ditolak. Bukan Admin." });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '12h' });
    
    res.json({ message: "Login Admin sukses", token, role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.email) {
      return res.status(404).json({ error: "Username tidak ditemukan atau tidak memiliki email." });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; 
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: '"Admin PT Radhika Narya Daruna" <no-reply@tokoanda.com>', 
      to: user.email,
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
    res.json({ message: `Link reset telah dikirim ke email ${user.email}` });
  } catch (error) {
    console.error("Gagal kirim email:", error);
    res.status(500).json({ error: "Gagal memproses permintaan." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiry: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ error: "Token tidak valid atau kadaluarsa" });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password berhasil diubah!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
