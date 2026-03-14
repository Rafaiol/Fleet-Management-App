const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Explicitly handle OPTIONS for all routes
app.options('*', cors());

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
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Fleet Management API',
    version: '1.0.0',
    status: 'Running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// MongoDB Connection and Server Startup
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management';

// Start server first so Railway health checks succeed
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Listening on 0.0.0.0:${PORT}`);
  
  // Connect to MongoDB after the server is up
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      // In production, we might want to stay alive even if DB is down temporarily
      // or exit if DB is critical. Let's log for now.
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Do not exit process in production unless absolutely necessary
});
