const mongoose = require('mongoose');
module.exports = async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/vistagram';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
