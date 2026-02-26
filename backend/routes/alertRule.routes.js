const express = require('express');
const router = express.Router();

const {
  getAllRules,
  createRule,
  updateRule,
  deleteRule
} = require('../controllers/alertRule.controller');

const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Any authenticated user can view rules
router.get('/', getAllRules);

// Only admins can create / update / delete rules
router.post('/', authorize('admin'), createRule);
router.put('/:id', authorize('admin'), updateRule);
router.delete('/:id', authorize('admin'), deleteRule);

module.exports = router;
