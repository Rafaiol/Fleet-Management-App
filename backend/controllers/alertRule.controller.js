const AlertRule = require('../models/AlertRule');
const { Vehicle } = require('../models');

// ────────────────────────────────────────────
// Helper:  Compute the derived value for a
//          vehicle given a condition field
// ────────────────────────────────────────────
function computeFieldValue(vehicle, field) {
  const now = new Date();
  const msBetween = (a, b) => Math.abs(a - b);
  const daysBetween = (a, b) => Math.floor(msBetween(a, b) / (1000 * 60 * 60 * 24));

  switch (field) {
    // ── Mileage since service ──
    case 'mileage_since_oil_change':
      return vehicle.currentMileage - (vehicle.maintenanceSchedule?.lastOilChangeMileage || 0);
    case 'mileage_since_tire_rotation':
      // Approximate: mileage intervals are tracked by km
      return vehicle.currentMileage - (vehicle.maintenanceSchedule?.lastTireRotationMileage || 0);
    case 'mileage_since_brake_check':
      return vehicle.currentMileage - (vehicle.maintenanceSchedule?.lastBrakeCheckMileage || 0);

    // ── Days since service ──
    case 'days_since_oil_change':
      return vehicle.maintenanceSchedule?.lastOilChange
        ? daysBetween(now, new Date(vehicle.maintenanceSchedule.lastOilChange))
        : Infinity;
    case 'days_since_tire_rotation':
      return vehicle.maintenanceSchedule?.lastTireRotation
        ? daysBetween(now, new Date(vehicle.maintenanceSchedule.lastTireRotation))
        : Infinity;
    case 'days_since_brake_check':
      return vehicle.maintenanceSchedule?.lastBrakeCheck
        ? daysBetween(now, new Date(vehicle.maintenanceSchedule.lastBrakeCheck))
        : Infinity;
    case 'days_since_general_inspection':
      return vehicle.maintenanceSchedule?.lastGeneralInspection
        ? daysBetween(now, new Date(vehicle.maintenanceSchedule.lastGeneralInspection))
        : Infinity;

    // ── Expiry countdown ──
    case 'registration_expiry_days':
      return vehicle.registrationExpiry
        ? daysBetween(new Date(vehicle.registrationExpiry), now)
        : Infinity;
    case 'insurance_expiry_days':
      return vehicle.insuranceExpiry
        ? daysBetween(new Date(vehicle.insuranceExpiry), now)
        : Infinity;

    // ── Vehicle property ──
    case 'current_mileage':
      return vehicle.currentMileage || 0;
    case 'vehicle_age':
      return new Date().getFullYear() - (vehicle.year || new Date().getFullYear());

    // ── Component condition (string values) ──
    case 'battery_condition':
      return vehicle.components?.battery?.condition || 'unknown';
    case 'brake_fluid_condition':
      return vehicle.components?.brakeFluid?.condition || 'unknown';
    case 'coolant_condition':
      return vehicle.components?.coolant?.condition || 'unknown';
    case 'engine_belt_condition':
      return vehicle.components?.engineBelt?.condition || 'unknown';
    case 'distribution_chain_condition':
      return vehicle.components?.distributionChain?.condition || 'unknown';

    default:
      return undefined;
  }
}

// ────────────────────────────────────────────
// Helper:  Evaluate operator
// ────────────────────────────────────────────
function evaluateCondition(actual, operator, threshold) {
  // String equality for component conditions
  if (typeof actual === 'string' || typeof threshold === 'string') {
    if (operator === '=') {
      return String(actual).toLowerCase() === String(threshold).toLowerCase();
    }
    return false;
  }

  const a = Number(actual);
  const t = Number(threshold);
  if (isNaN(a) || isNaN(t)) return false;

  switch (operator) {
    case '>': return a > t;
    case '>=': return a >= t;
    case '<': return a < t;
    case '<=': return a <= t;
    case '=': return a === t;
    default: return false;
  }
}

// ────────────────────────────────────────────
// Evaluate all active rules against vehicle data
// Returns array of alert objects
// ────────────────────────────────────────────
async function evaluateAllRules() {
  const rules = await AlertRule.find({ isActive: true });
  if (rules.length === 0) return [];

  const vehicles = await Vehicle.find({ status: { $ne: 'retired' } });
  const alerts = [];

  for (const rule of rules) {
    for (const vehicle of vehicles) {
      const actual = computeFieldValue(vehicle, rule.conditionField);
      if (actual === undefined) continue;

      if (evaluateCondition(actual, rule.operator, rule.value)) {
        alerts.push({
          type: 'custom_rule',
          severity: rule.severity,
          message: `[${rule.name}] ${vehicle.plateNumber} — ${rule.description || `${rule.conditionField} ${rule.operator} ${rule.value}`}`,
          vehicle: vehicle._id,
          plateNumber: vehicle.plateNumber,
          ruleId: rule._id,
          ruleName: rule.name,
          date: new Date()
        });
      }
    }
  }

  return alerts;
}

// ────────────────────────────────────────────
// CRUD Controllers
// ────────────────────────────────────────────

// @desc    Get all alert rules
// @route   GET /api/alert-rules
// @access  Private
exports.getAllRules = async (req, res) => {
  try {
    const rules = await AlertRule.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    console.error('Get alert rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert rules',
      error: error.message
    });
  }
};

// @desc    Create a new alert rule
// @route   POST /api/alert-rules
// @access  Admin only
exports.createRule = async (req, res) => {
  try {
    const { name, description, conditionField, operator, value, severity } = req.body;

    const rule = await AlertRule.create({
      name,
      description,
      conditionField,
      operator,
      value,
      severity,
      createdBy: req.user._id
    });

    const populated = await rule.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Create alert rule error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating alert rule'
    });
  }
};

// @desc    Update an alert rule
// @route   PUT /api/alert-rules/:id
// @access  Admin only
exports.updateRule = async (req, res) => {
  try {
    const { name, description, conditionField, operator, value, severity, isActive } = req.body;

    const rule = await AlertRule.findByIdAndUpdate(
      req.params.id,
      { name, description, conditionField, operator, value, severity, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Alert rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Update alert rule error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating alert rule'
    });
  }
};

// @desc    Delete an alert rule
// @route   DELETE /api/alert-rules/:id
// @access  Admin only
exports.deleteRule = async (req, res) => {
  try {
    const rule = await AlertRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Alert rule not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert rule deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert rule',
      error: error.message
    });
  }
};

// Export the engine so dashboard.controller can use it
exports.evaluateAllRules = evaluateAllRules;
