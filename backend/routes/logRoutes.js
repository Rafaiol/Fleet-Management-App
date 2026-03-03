const express = require('express');
const router = express.Router();
const { getLogs, undoAction, deleteAllLogs, exportLogs } = require('../controllers/logController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Note: /export must come before /:id so it doesn't get parsed as an ID
router.route('/export')
  .get(authorize('admin'), exportLogs);

router.route('/')
  .get(authorize('admin'), getLogs)
  .delete(authorize('admin'), deleteAllLogs);

router.route('/:id/undo')
  .post(authorize('admin'), undoAction);

module.exports = router;
