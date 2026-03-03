const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

// Helper generic way to reconstruct models dynamically based on resourceType for Undos
const modelMap = {
  Vehicle: require('../models/Vehicle'),
  Maintenance: require('../models/Maintenance'),
  AlertRule: require('../models/AlertRule'),
  User: require('../models/User'),
};

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};

    // Filtering
    if (req.query.action) query.action = req.query.action;
    if (req.query.resourceType) query.resourceType = req.query.resourceType;
    if (req.query.userId) query.user = req.query.userId;

    // Search by description
    if (req.query.search) {
      query.description = { $regex: req.query.search, $options: 'i' };
    }

    const total = await ActivityLog.countDocuments(query);

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'firstName lastName email role');

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
};

// @desc    Undo an action
// @route   POST /api/logs/:id/undo
// @access  Private/Admin
const undoAction = async (req, res) => {
  try {
    const logId = req.params.id;
    const log = await ActivityLog.findById(logId);

    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    // Prevent undoing an already-undone action
    if (log.undone) {
      return res.status(400).json({ message: 'This action has already been undone.' });
    }

    if (log.action === 'CREATE') {
      return res.status(400).json({ message: 'Cannot undo a CREATE action directly yet. Just delete the resource.' });
    }

    if (log.action === 'EXPORT') {
      return res.status(400).json({ message: 'Cannot undo an EXPORT action.' });
    }

    const Model = modelMap[log.resourceType];
    if (!Model) {
      return res.status(400).json({ message: `Cannot undo actions for resource type: ${log.resourceType}` });
    }

    if (log.action === 'DELETE') {
      // Re-insert the document exactly as it was
      if (!log.previousState) {
        return res.status(400).json({ message: 'No previous state found to restore.' });
      }

      // Strip internal MongoDB/Mongoose fields that would conflict
      const { _id, __v, createdAt, updatedAt, id, ...restoreData } = log.previousState;

      let restoredDoc;
      try {
        // Try to restore with original ID to keep relationships intact
        const docWithId = new Model({ ...restoreData, _id: log.previousState._id });
        await docWithId.save({ validateBeforeSave: false });
        restoredDoc = docWithId;
      } catch (saveErr) {
        // If that fails (e.g. duplicate key), create without original _id
        restoredDoc = await Model.create(restoreData);
      }

      // Log the undo — mark as undone:true so no Undo button appears on this entry
      await ActivityLog.create({
        user: req.user._id,
        action: 'CREATE',
        resourceType: log.resourceType,
        resourceId: restoredDoc._id,
        description: `UNDID DELETION: Restored ${log.resourceType}`,
        newState: restoredDoc.toObject(),
        undone: true,
      });

      // Mark original log as undone so its Undo button disappears
      await ActivityLog.findByIdAndUpdate(logId, { undone: true });

    } else if (log.action === 'UPDATE') {
      // Revert the document to the previous state
      if (!log.previousState) {
        return res.status(400).json({ message: 'No previous state found to revert to.' });
      }

      // Strip internal MongoDB/Mongoose fields that should not be overwritten
      const { _id, __v, createdAt, updatedAt, id, ...revertData } = log.previousState;

      const updatedDoc = await Model.findByIdAndUpdate(
        log.resourceId,
        { $set: revertData },
        { new: true }
      );

      if (!updatedDoc) {
        return res.status(404).json({ message: 'Original document was not found. It may have been deleted.' });
      }

      // Log the undo — mark as undone:true so no Undo button appears on this entry
      await ActivityLog.create({
        user: req.user._id,
        action: 'UPDATE',
        resourceType: log.resourceType,
        resourceId: updatedDoc._id,
        description: `UNDID UPDATE: Reverted ${log.resourceType} to previous state`,
        previousState: log.newState,
        newState: updatedDoc.toObject(),
        undone: true,
      });

      // Mark original log as undone so its Undo button disappears
      await ActivityLog.findByIdAndUpdate(logId, { undone: true });
    }

    res.json({ message: 'Undo successful' });
  } catch (error) {
    console.error('Error undoing action:', error);
    res.status(500).json({ message: 'Server error processing undo' });
  }
};

module.exports = {
  getLogs,
  undoAction,
};
