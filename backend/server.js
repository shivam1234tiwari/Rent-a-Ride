const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup for live tracking
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join booking room for live tracking
  socket.on('join-booking', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    console.log(`Client ${socket.id} joined booking-${bookingId}`);
  });
  
  // Driver location update
  socket.on('driver-location-update', (data) => {
    const { bookingId, location } = data;
    io.to(`booking-${bookingId}`).emit('location-update', {
      bookingId,
      location,
      timestamp: new Date(),
    });
  });
  
  // Driver status update
  socket.on('driver-status', (data) => {
    const { driverId, status } = data;
    io.emit(`driver-${driverId}-status`, { driverId, status });
  });
  
  // Chat message
  socket.on('chat-message', (data) => {
    const { bookingId, message, user } = data;
    io.to(`booking-${bookingId}`).emit('new-message', {
      message,
      user,
      timestamp: new Date(),
    });
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/user', require('./routes/user'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/pricing', require('./routes/pricing'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RentWheels API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      bookings: '/api/bookings',
      user: '/api/user',
      drivers: '/api/drivers',
      chat: '/api/chat',
      pricing: '/api/pricing',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.url}`,
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('✅ Database disconnected');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log('========================================\n');
});