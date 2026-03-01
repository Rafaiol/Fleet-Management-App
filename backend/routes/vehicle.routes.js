const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  getVehicleMakes,
  updateMileage,
  getVehiclesNeedingMaintenance
} = require('../controllers/vehicle.controller');

const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');

// Validation middleware
const createVehicleValidation = [
  body('plateNumber')
    .trim()
    .notEmpty().withMessage('Plate number is required')
    .toUpperCase(),
  body('make')
    .trim()
    .notEmpty().withMessage('Make is required'),
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('status')
    .optional()
    .isIn(['active', 'maintenance', 'offline', 'retired'])
    .withMessage('Invalid status')
];

const updateVehicleValidation = [
  body('plateNumber')
    .optional()
    .trim()
    .toUpperCase(),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('status')
    .optional()
    .isIn(['active', 'maintenance', 'offline', 'retired'])
    .withMessage('Invalid status')
];

const updateMileageValidation = [
  body('mileage')
    .notEmpty().withMessage('Mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', getAllVehicles);
router.get('/stats/overview', getVehicleStats);
router.get('/filters/makes', getVehicleMakes);
router.get('/maintenance/due', getVehiclesNeedingMaintenance);
router.get('/:id', getVehicle);
router.post('/', checkPermission('add_vehicles'), createVehicleValidation, createVehicle);
router.put('/:id', checkPermission('edit_vehicles'), updateVehicleValidation, updateVehicle);
router.delete('/:id', checkPermission('delete_vehicles'), deleteVehicle);
router.put('/:id/mileage', updateMileageValidation, updateMileage);

module.exports = router;
