require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rs_industries';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (Modular)');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
