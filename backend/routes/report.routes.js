const express = require('express');
const router = express.Router();

const {
  generateVehicleReport,
  generateMaintenanceReport,
  generateFleetSummary
} = require('../controllers/report.controller');

const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/vehicle/:id', generateVehicleReport);
router.get('/maintenance/:id', generateMaintenanceReport);
router.get('/fleet-summary', authorize('admin'), generateFleetSummary);

module.exports = router;
