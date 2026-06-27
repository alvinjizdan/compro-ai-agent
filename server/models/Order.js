const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  customerName: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    default: 'Menunggu Konfirmasi',
    enum: ['Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Batal']
  },
  date: { type: Date, default: Date.now },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);