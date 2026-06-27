const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { customerName, items, totalPrice } = req.body;
    
    const newOrder = await Order.create({
      customerName,
      items, 
      totalPrice
    });

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const itemDibeli = items[i];
        const product = await Product.findOne({ name: itemDibeli.name });

        if (product) {
          let sisaStok = product.stock - itemDibeli.quantity;
          if (sisaStok < 0) sisaStok = 0; 
          
          product.stock = sisaStok;
          await product.save();
        }
      }
    }

    res.json({ message: "Order berhasil dicatat & Stok otomatis berkurang!", order: newOrder });
  } catch (error) {
    console.error("Error saat mencatat order:", error);
    res.status(500).json({ error: "Gagal mencatat order dan update stok" });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
    }

    const orders = await Order.find(query).sort({ date: -1 });

    const formattedOrders = orders.map(order => ({
        id: order._id,
        customerName: order.customerName,
        totalPrice: order.totalPrice,
        status: order.status,
        date: order.date,
        items: JSON.stringify(order.items) 
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status diperbarui" });
  } catch (error) {
    res.status(500).json({ error: "Gagal update status" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Pesanan dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus pesanan" });
  }
};
