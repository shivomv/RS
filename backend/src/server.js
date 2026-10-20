require('dotenv').config();
const { connectDB } = require('./config/database');
const { syncDatabase } = require('./models');
const http = require('http');
const app = require('./app');
const { initRealtimeServer } = require('./services/realtime.service');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await syncDatabase();
    
    const server = http.createServer(app);
    initRealtimeServer(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} with Realtime Order Channel active`);
    });
  } catch (err) {
    console.error('❌ Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();
