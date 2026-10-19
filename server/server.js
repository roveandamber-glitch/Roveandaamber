import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { initDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// ==========================================
// 1. Process Level Safety & Error Handlers
// ==========================================
process.on('uncaughtException', (err) => {
  console.error('💥 [FATAL] Uncaught Exception:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// ==========================================
// 2. Server Initialization & Boot
// ==========================================
const startServer = async () => {
  try {
    // Initialize Database and initial seeds
    await initDB();

    server = app.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log(` ROVE & AMBER Luxury API Server running`);
      console.log(` Port:        http://localhost:${PORT}`);
      console.log(` Environment: ${NODE_ENV}`);
      console.log(` Security:    Helmet + Rate Limiting + CORS Guard`);
      console.log('----------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ==========================================
// 3. Graceful Shutdown Handlers
// ==========================================
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log(' HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed cleanly.');
      } catch (err) {
        console.error('⚠️ Error closing MongoDB connection:', err.message);
      }
      process.exit(0);
    });

    // Force close if graceful shutdown takes too long (10 seconds timeout)
    setTimeout(() => {
      console.error('⚠️ Forcefully terminating after shutdown timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
