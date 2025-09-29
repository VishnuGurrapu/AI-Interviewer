/**
 * Safe version of the main server file
 * This version loads modules safely and provides better error reporting
 */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  console.log('🔄 Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  console.log('🔄 Server will continue running...');
});

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "UP", 
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// Basic test route
app.get("/api/test", (req, res) => {
  res.status(200).json({ 
    message: "Basic API is working",
    env: process.env.NODE_ENV || 'development'
  });
});

// Load routes safely
const loadRoutes = async () => {
  try {
    console.log('📡 Loading API routes (safe version)...');
    const apiRoutes = await import("./routes/index-safe.js");
    app.use("/api", apiRoutes.default);
    console.log('✅ API routes loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load API routes:', error.message);
    console.log('🔄 Server will continue with basic routes only');
    
    // Fallback routes
    app.all('/api*', (req, res) => {
      res.status(503).json({ 
        error: 'API routes not available',
        message: 'Check server logs for details'
      });
    });
  }
};

// Load error handlers safely
const loadErrorHandlers = async () => {
  try {
    const { errorHandler, notFound } = await import("./middleware/errorHandler.js");
    app.use(notFound);
    app.use(errorHandler);
    console.log('✅ Error handlers loaded');
  } catch (error) {
    console.error('❌ Failed to load error handlers:', error.message);
    
    // Fallback error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(500).json({ message: 'Internal Server Error' });
    });
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-interviewer";
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔄 Server will continue without database');
  }
};

// Start server
const startServer = async () => {
  console.log('🚀 Starting AI Interview Assistant Backend...\n');
  
  // Load components
  await connectDB();
  await loadRoutes();
  await loadErrorHandlers();
  
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`\n🎉 Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log('\n✨ Server started successfully!');
  });
};

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});
