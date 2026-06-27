const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const formattedUsers = users.map(u => ({
        id: u._id,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: "Gagal ambil user" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    res.json({ message: "Role berhasil diubah" });
  } catch (error) {
    res.status(500).json({ error: "Gagal update role" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus user" });
  }
};
