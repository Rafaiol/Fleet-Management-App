const express = require('express');
const router = express.Router();

const {
  getAllRules,
  createRule,
  updateRule,
  deleteRule
} = require('../controllers/alertRule.controller');

const { authenticate, authorize, checkPermission } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Any authenticated user can view rules
router.get('/', getAllRules);

// Only specific permissions can create / update / delete rules
router.post('/', checkPermission('add_alerts'), createRule);
router.put('/:id', checkPermission('edit_alerts'), updateRule);
router.delete('/:id', checkPermission('delete_alerts'), deleteRule);

module.exports = router;
