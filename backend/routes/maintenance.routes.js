const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllMaintenance,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats,
  getVehicleTimeline,
  completeMaintenance,
  getMaintenanceTypes
} = require('../controllers/maintenance.controller');

const { authenticate, authorize } = require('../middleware/auth.middleware');

// Validation middleware
const createMaintenanceValidation = [
  body('vehicle')
    .notEmpty().withMessage('Vehicle is required')
    .isMongoId().withMessage('Invalid vehicle ID'),
  body('type')
    .notEmpty().withMessage('Maintenance type is required')
    .isIn([
      'oil_change', 'tire_rotation', 'brake_service', 'battery_replacement',
      'chain_replacement', 'belt_replacement', 'brake_fluid_change', 'coolant_change',
      'general_inspection', 'engine_repair', 'transmission_repair', 'electrical_repair',
      'body_work', 'other'
    ]).withMessage('Invalid maintenance type'),
  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

const updateMaintenanceValidation = [
  body('type')
    .optional()
    .isIn([
      'oil_change', 'tire_rotation', 'brake_service', 'battery_replacement',
      'chain_replacement', 'belt_replacement', 'brake_fluid_change', 'coolant_change',
      'general_inspection', 'engine_repair', 'transmission_repair', 'electrical_repair',
      'body_work', 'other'
    ]).withMessage('Invalid maintenance type'),
  body('scheduledDate')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
];

const completeMaintenanceValidation = [
  body('workPerformed')
    .notEmpty().withMessage('Work performed description is required'),
  body('mileageAtService')
    .optional()
    .isInt({ min: 0 }).withMessage('Mileage must be a positive number')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getAllMaintenance);
router.get('/stats/overview', getMaintenanceStats);
router.get('/filters/types', getMaintenanceTypes);
router.get('/vehicle/:vehicleId/timeline', getVehicleTimeline);
router.get('/:id', getMaintenance);
router.post('/', createMaintenanceValidation, createMaintenance);
router.put('/:id', updateMaintenanceValidation, updateMaintenance);
router.put('/:id/complete', completeMaintenanceValidation, completeMaintenance);
router.delete('/:id', authorize('admin'), deleteMaintenance);

module.exports = router;
