const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    // Mapping _id ke id agar Frontend React tidak error
    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: p.image,
      description: p.description
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = await Product.create({
      name, category, price, stock, description, image: imageUrl
    });

    res.json({ ...newProduct._doc, id: newProduct._id });
  } catch (error) {
    res.status(500).json({ error: "Gagal tambah produk" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    let updateData = { name, category, price, stock, description };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!updatedProduct) return res.status(404).json({ error: "Produk tidak ditemukan" });
    
    res.json({ ...updatedProduct._doc, id: updatedProduct._id });
  } catch (error) {
    res.status(500).json({ error: "Gagal update produk" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Produk tidak ditemukan" });
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus produk" });
  }
};
