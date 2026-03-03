const express = require('express');
const router = express.Router();
const { getLogs, undoAction } = require('../controllers/logController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.route('/')
  .get(authorize('admin'), getLogs);

router.route('/:id/undo')
  .post(authorize('admin'), undoAction);

module.exports = router;
