const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['Vehicle', 'Maintenance', 'AlertRule', 'User', 'Report'],
    required: true,
  },
  resourceId: {
    type: String,
    required: false, // Not required for fleet-wide exports
  },
  description: {
    type: String,
    required: true,
  },
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  undone: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
