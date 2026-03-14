const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management';

console.log(`--- BACKEND VERSION 4.0 (PID: ${process.pid}) ---`);

// 1. Force CORS headers on EVERYTHING before any other middleware
app.use((req, res, next) => {
  const origin = req.header('Origin') || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');
const alertRuleRoutes = require('./routes/alertRule.routes');
const logRoutes = require('./routes/logRoutes');

// Import error handler
const errorHandler = require('./middleware/error.middleware');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for reports
app.use('/reports', express.static('reports'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alert-rules', alertRuleRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fleet Management API is running',
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Fleet Management API',
    version: '4.0.0',
    status: 'Running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
    pid: process.pid
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server first so Railway health checks succeed
app.listen(PORT, '0.0.0.0', () => {
  console.log(`--- SERVER READY ON PORT ${PORT} (PID: ${process.pid}) ---`);
  
  // Connect to MongoDB after the server is up
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
