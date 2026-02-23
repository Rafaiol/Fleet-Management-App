const express = require('express');
const router = express.Router();

const {
  getOverview,
  getTrends,
  getVehicleStatus,
  getMaintenanceTypes,
  getCostAnalysis,
  getAlerts
} = require('../controllers/dashboard.controller');

const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/vehicle-status', getVehicleStatus);
router.get('/maintenance-types', getMaintenanceTypes);
router.get('/cost-analysis', getCostAnalysis);
router.get('/alerts', getAlerts);

module.exports = router;
