const mongoose = require('mongoose');

const partsUsedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalPrice: {
    type: Number,
    min: 0
  }
}, { _id: true });

// Calculate total price before saving
partsUsedSchema.pre('save', function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

const maintenanceSchema = new mongoose.Schema({
  // Reference to Vehicle
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required'],
    index: true
  },

  // Maintenance Details
  type: {
    type: String,
    required: [true, 'Maintenance type is required'],
    enum: [
      'oil_change',
      'tire_rotation',
      'brake_service',
      'battery_replacement',
      'chain_replacement',
      'belt_replacement',
      'brake_fluid_change',
      'coolant_change',
      'general_inspection',
      'engine_repair',
      'transmission_repair',
      'electrical_repair',
      'body_work',
      'other'
    ]
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },

  // Dates
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    index: true
  },
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },

  // Mileage Information
  mileageAtService: {
    type: Number,
    min: 0
  },
  nextServiceMileage: {
    type: Number,
    min: 0
  },
  nextServiceDate: {
    type: Date
  },

  // Service Details
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  workPerformed: {
    type: String,
    maxlength: [3000, 'Work performed cannot exceed 3000 characters']
  },

  // Parts & Labor
  partsUsed: [partsUsedSchema],
  laborHours: {
    type: Number,
    min: 0,
    default: 0
  },
  laborRate: {
    type: Number,
    min: 0,
    default: 0
  },
  laborCost: {
    type: Number,
    min: 0,
    default: 0
  },
  partsCost: {
    type: Number,
    min: 0,
    default: 0
  },
  totalCost: {
    type: Number,
    min: 0,
    default: 0
  },

  // Service Provider
  serviceProvider: {
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },

  // Technician Information
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  technicianName: {
    type: String,
    trim: true
  },

  // Priority & Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Warranty Information
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    warrantyMonths: {
      type: Number,
      min: 0,
      default: 0
    },
    warrantyExpiry: {
      type: Date
    }
  },

  // Documents & Images
  documents: [{
    name: String,
    url: String,
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Invoice Information
  invoiceNumber: {
    type: String,
    trim: true
  },
  invoiceDate: {
    type: Date
  },

  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for maintenance duration
maintenanceSchema.virtual('duration').get(function () {
  if (this.startDate && this.completionDate) {
    return Math.ceil((this.completionDate - this.startDate) / (1000 * 60 * 60)); // Hours
  }
  return null;
});

// Virtual for days until scheduled
maintenanceSchema.virtual('daysUntilScheduled').get(function () {
  if (this.scheduledDate) {
    const diff = this.scheduledDate - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to calculate costs
maintenanceSchema.pre('save', function (next) {
  // Calculate parts cost
  if (this.partsUsed && this.partsUsed.length > 0) {
    this.partsCost = this.partsUsed.reduce((sum, part) => sum + (part.totalPrice || 0), 0);
  }

  // Calculate labor cost
  this.laborCost = (this.laborHours || 0) * (this.laborRate || 0);

  // Calculate total cost
  this.totalCost = this.partsCost + this.laborCost;

  // Set warranty expiry if applicable
  if (this.warranty && this.warranty.hasWarranty && this.completionDate && this.warranty.warrantyMonths) {
    const expiry = new Date(this.completionDate);
    expiry.setMonth(expiry.getMonth() + this.warranty.warrantyMonths);
    this.warranty.warrantyExpiry = expiry;
  }

  next();
});

// Indexes for performance
maintenanceSchema.index({ vehicle: 1, scheduledDate: -1 });
maintenanceSchema.index({ type: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ createdAt: -1 });
maintenanceSchema.index({ 'serviceProvider.name': 1 });

// Static method to get maintenance statistics
maintenanceSchema.statics.getStatistics = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.scheduledDate = {};
    if (startDate) matchStage.scheduledDate.$gte = new Date(startDate);
    if (endDate) matchStage.scheduledDate.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalCost: { $sum: '$totalCost' },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        scheduledCount: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        },
        inProgressCount: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        avgCost: { $avg: '$totalCost' }
      }
    }
  ]);
};

// Static method to get maintenance by type
maintenanceSchema.statics.getByType = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.scheduledDate = {};
    if (startDate) matchStage.scheduledDate.$gte = new Date(startDate);
    if (endDate) matchStage.scheduledDate.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCost: { $sum: '$totalCost' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Maintenance', maintenanceSchema);
