const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus
} = require('../controllers/user.controller');

const { authenticate, authorize } = require('../middleware/auth.middleware');

// Validation middleware
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/stats/overview', authorize('admin'), getUserStats);
router.get('/:id', getUser);
router.put('/:id', updateUserValidation, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;
