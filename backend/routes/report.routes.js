const express = require('express');
const router = express.Router();

const {
  generateVehicleReport,
  generateMaintenanceReport,
  generateFleetSummary,
  generateVehiclesActivityReport,
  generateMaintenanceActivityReport
} = require('../controllers/report.controller');

const {
  generateFleetSummaryExcel,
  generateVehiclesExcel,
  generateMaintenanceExcel,
} = require('../controllers/excel.controller');

const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// PDF Routes
router.get('/vehicle/:id', generateVehicleReport);
router.get('/maintenance/:id', generateMaintenanceReport);
router.get('/fleet-summary', authorize('admin'), generateFleetSummary);
router.get('/vehicles-activity', authorize('admin'), generateVehiclesActivityReport);
router.get('/maintenance-activity', authorize('admin'), generateMaintenanceActivityReport);

// Excel Routes
router.get('/excel/fleet-summary', authorize('admin'), generateFleetSummaryExcel);
router.get('/excel/vehicles-activity', authorize('admin'), generateVehiclesExcel);
router.get('/excel/maintenance-activity', authorize('admin'), generateMaintenanceExcel);

module.exports = router;

