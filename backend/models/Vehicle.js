const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true,
    index: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  vin: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    uppercase: true
  },

  // Vehicle Details
  color: {
    type: String,
    trim: true
  },
  bodyType: {
    type: String,
    enum: ['sedan', 'suv', 'truck', 'van', 'bus', 'motorcycle', 'other'],
    default: 'sedan'
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'lpg'],
    default: 'gasoline'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'cvt'],
    default: 'manual'
  },
  engineSize: {
    type: Number,
    min: 0
  },
  horsepower: {
    type: Number,
    min: 0
  },

  // Registration & Insurance
  registrationDate: {
    type: Date
  },
  registrationExpiry: {
    type: Date
  },
  insuranceNumber: {
    type: String,
    trim: true
  },
  insuranceExpiry: {
    type: Date
  },

  // Status & Assignment
  status: {
    type: String,
    enum: ['active', 'maintenance', 'offline', 'retired'],
    default: 'active',
    index: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  department: {
    type: String,
    trim: true
  },

  // Mileage & Usage
  currentMileage: {
    type: Number,
    default: 0,
    min: 0
  },
  mileageUnit: {
    type: String,
    enum: ['km', 'miles'],
    default: 'km'
  },

  // Maintenance Schedule
  maintenanceSchedule: {
    oilChangeInterval: {
      type: Number,
      default: 5000, // km
      min: 0
    },
    lastOilChange: {
      type: Date
    },
    lastOilChangeMileage: {
      type: Number,
      default: 0
    },
    tireRotationInterval: {
      type: Number,
      default: 10000, // km
      min: 0
    },
    lastTireRotation: {
      type: Date
    },
    brakeCheckInterval: {
      type: Number,
      default: 15000, // km
      min: 0
    },
    lastBrakeCheck: {
      type: Date
    },
    generalInspectionInterval: {
      type: Number,
      default: 6, // months
      min: 0
    },
    lastGeneralInspection: {
      type: Date
    }
  },

  // Component Status (from original app)
  components: {
    battery: {
      lastReplaced: Date,
      condition: { type: String, enum: ['good', 'fair', 'poor', 'unknown'], default: 'unknown' },
      nextReplacementDate: Date
    },
    distributionChain: {
      lastReplaced: Date,
      condition: { type: String, enum: ['good', 'fair', 'poor', 'unknown'], default: 'unknown' },
      nextReplacementDate: Date
    },
    engineBelt: {
      lastReplaced: Date,
      condition: { type: String, enum: ['good', 'fair', 'poor', 'unknown'], default: 'unknown' },
      nextReplacementDate: Date
    },
    brakeFluid: {
      lastChanged: Date,
      condition: { type: String, enum: ['good', 'fair', 'poor', 'unknown'], default: 'unknown' },
      nextChangeDate: Date
    },
    coolant: {
      lastChanged: Date,
      condition: { type: String, enum: ['good', 'fair', 'poor', 'unknown'], default: 'unknown' },
      nextChangeDate: Date
    }
  },

  // Purchase Information
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },

  // Notes & Images
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

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

// Virtual for vehicle age
vehicleSchema.virtual('age').get(function () {
  return new Date().getFullYear() - this.year;
});

// Virtual for next scheduled maintenance
vehicleSchema.virtual('nextScheduledMaintenance').get(function () {
  const schedules = [];
  const now = new Date();

  // Oil change
  if (this.maintenanceSchedule.lastOilChange) {
    const nextOil = new Date(this.maintenanceSchedule.lastOilChange);
    nextOil.setMonth(nextOil.getMonth() + 3); // Approximate 3 months
    schedules.push({ type: 'Oil Change', date: nextOil });
  }

  // Registration
  if (this.registrationExpiry && this.registrationExpiry > now) {
    schedules.push({ type: 'Registration Renewal', date: this.registrationExpiry });
  }

  // Insurance
  if (this.insuranceExpiry && this.insuranceExpiry > now) {
    schedules.push({ type: 'Insurance Renewal', date: this.insuranceExpiry });
  }

  // Component replacements
  if (this.components) {
    Object.entries(this.components).forEach(([key, component]) => {
      if (component && component.nextReplacementDate && component.nextReplacementDate > now) {
        schedules.push({
          type: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          date: component.nextReplacementDate
        });
      }
    });
  }

  return schedules.sort((a, b) => a.date - b.date);
});

// Indexes for performance
vehicleSchema.index({ plateNumber: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ make: 1 });
vehicleSchema.index({ 'maintenanceSchedule.lastOilChange': 1 });
vehicleSchema.index({ registrationExpiry: 1 });
vehicleSchema.index({ insuranceExpiry: 1 });
vehicleSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
vehicleSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
