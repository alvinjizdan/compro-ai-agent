const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Menggunakan variabel lingkungan dari Docker, atau fallback ke localhost jika tanpa Docker
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/radhika_pos_db';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Terkoneksi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;