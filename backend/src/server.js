require('dotenv').config();
const { connectDB } = require('./config/database');
const { syncDatabase } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await syncDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();
