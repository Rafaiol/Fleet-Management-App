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

// Import error handler
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Fleet Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Fleet Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      vehicles: '/api/vehicles',
      maintenance: '/api/maintenance',
      dashboard: '/api/dashboard',
      reports: '/api/reports'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
