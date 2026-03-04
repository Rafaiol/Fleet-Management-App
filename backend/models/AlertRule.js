const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  conditionField: {
    type: String,
    required: [true, 'Condition field is required'],
    enum: [
      // Mileage since service
      'mileage_since_oil_change',
      'mileage_since_tire_rotation',
      'mileage_since_brake_check',
      'mileage_since_battery_replacement',
      'mileage_since_brake_fluid_change',
      'mileage_since_engine_belt_replacement',
      'mileage_since_distribution_chain_replacement',
      'mileage_since_coolant_change',
      // Days since service
      'days_since_oil_change',
      'days_since_tire_rotation',
      'days_since_brake_check',
      'days_since_general_inspection',
      'days_since_battery_replacement',
      'days_since_brake_fluid_change',
      'days_since_engine_belt_replacement',
      'days_since_distribution_chain_replacement',
      'days_since_coolant_change',
      // Expiry countdown
      'registration_expiry_days',
      'insurance_expiry_days',
      // Vehicle property
      'current_mileage',
      'vehicle_age',
      // Component condition
      'battery_condition',
      'brake_fluid_condition',
      'coolant_condition',
      'engine_belt_condition',
      'distribution_chain_condition'
    ]
  },
  operator: {
    type: String,
    required: [true, 'Operator is required'],
    enum: ['>', '>=', '<', '<=', '=']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Threshold value is required']
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'urgent'],
    default: 'warning'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying of active rules
alertRuleSchema.index({ isActive: 1 });
alertRuleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('AlertRule', alertRuleSchema);
