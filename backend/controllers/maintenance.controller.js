const { validationResult } = require('express-validator');
const { Maintenance, Vehicle } = require('../models');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
exports.getAllMaintenance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      vehicle,
      status,
      type,
      priority,
      startDate,
      endDate,
      search,
      sortBy = 'scheduledDate',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (vehicle) query.vehicle = vehicle;
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    // Handle specific text search
    if (search) {
      // First, try to find any vehicles that match the search (by make, model, or plateNumber)
      const matchingVehicles = await Vehicle.find({
        $or: [
          { plateNumber: { $regex: search, $options: 'i' } },
          { make: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const vehicleIds = matchingVehicles.map(v => v._id);

      // Add $or conditional to maintenance query 
      // match description OR match a found vehicle
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { $expr: { $regexMatch: { input: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate", onNull: "" } }, regex: search, options: "i" } } },
        { $expr: { $regexMatch: { input: { $dateToString: { format: "%Y-%m-%d", date: "$completionDate", onNull: "" } }, regex: search, options: "i" } } }
      ];

      if (vehicleIds.length > 0) {
        query.$or.push({ vehicle: { $in: vehicleIds } });
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const maintenance = await Maintenance.find(query)
      .populate('vehicle', 'plateNumber make model year')
      .populate('technician', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Maintenance.countDocuments(query);

    res.json({
      success: true,
      data: maintenance,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance records',
      error: error.message
    });
  }
};

// @desc    Get single maintenance record
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('vehicle', 'plateNumber make model year vin currentMileage')
      .populate('technician', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance record',
      error: error.message
    });
  }
};

// @desc    Create new maintenance record
// @route   POST /api/maintenance
// @access  Private
exports.createMaintenance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const maintenanceData = {
      ...req.body,
      createdBy: req.user._id
    };

    const maintenance = await Maintenance.create(maintenanceData);

    // Update vehicle status to maintenance if scheduled or in_progress
    if (['scheduled', 'in_progress'].includes(maintenance.status)) {
      vehicle.status = 'maintenance';
      await vehicle.save();
    }

    // Populate and return
    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('vehicle', 'plateNumber make model year')
      .populate('technician', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: populatedMaintenance
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance record',
      error: error.message
    });
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private
exports.updateMaintenance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    // Update the record
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    )
      .populate('vehicle', 'plateNumber make model year')
      .populate('technician', 'firstName lastName');

    // Update vehicle status based on maintenance status
    const vehicle = await Vehicle.findById(maintenance.vehicle);
    if (vehicle) {
      if (req.body.status === 'completed') {
        vehicle.status = 'active';

        // Update maintenance schedule based on type
        const now = new Date();
        switch (maintenance.type) {
          case 'oil_change':
            vehicle.maintenanceSchedule.lastOilChange = now;
            vehicle.maintenanceSchedule.lastOilChangeMileage = req.body.mileageAtService || vehicle.currentMileage;
            break;
          case 'tire_rotation':
            vehicle.maintenanceSchedule.lastTireRotation = now;
            break;
          case 'brake_service':
            vehicle.maintenanceSchedule.lastBrakeCheck = now;
            break;
          case 'general_inspection':
            vehicle.maintenanceSchedule.lastGeneralInspection = now;
            break;
          case 'battery_replacement':
            vehicle.components.battery.lastReplaced = now;
            break;
          case 'chain_replacement':
            vehicle.components.distributionChain.lastReplaced = now;
            break;
          case 'belt_replacement':
            vehicle.components.engineBelt.lastReplaced = now;
            break;
          case 'brake_fluid_change':
            vehicle.components.brakeFluid.lastChanged = now;
            break;
          case 'coolant_change':
            vehicle.components.coolant.lastChanged = now;
            break;
        }

        await vehicle.save();
      } else if (['scheduled', 'in_progress'].includes(req.body.status)) {
        vehicle.status = 'maintenance';
        await vehicle.save();
      }
    }

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updatedMaintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance record',
      error: error.message
    });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin only)
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    // Update vehicle status back to active if maintenance was in progress
    if (maintenance.status === 'in_progress' || maintenance.status === 'scheduled') {
      const vehicle = await Vehicle.findById(maintenance.vehicle);
      if (vehicle && vehicle.status === 'maintenance') {
        vehicle.status = 'active';
        await vehicle.save();
      }
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance record',
      error: error.message
    });
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats/overview
// @access  Private
exports.getMaintenanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Maintenance.getStatistics(startDate, endDate);
    const byType = await Maintenance.getByType(startDate, endDate);

    // Get upcoming maintenance
    const upcoming = await Maintenance.find({
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'in_progress'] }
    })
      .populate('vehicle', 'plateNumber make model')
      .sort({ scheduledDate: 1 })
      .limit(10);

    // Get recent completed maintenance
    const recentCompleted = await Maintenance.find({
      status: 'completed'
    })
      .populate('vehicle', 'plateNumber make model')
      .sort({ completionDate: -1 })
      .limit(10);

    // Get total cost
    const totalCostResult = await Maintenance.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    const totalCost = totalCostResult.length > 0 ? totalCostResult[0].total : 0;

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalRecords: 0,
          totalCost: 0,
          completedCount: 0,
          scheduledCount: 0,
          inProgressCount: 0,
          avgCost: 0
        },
        byType,
        upcoming,
        recentCompleted,
        totalCost
      }
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance statistics',
      error: error.message
    });
  }
};

// @desc    Get maintenance timeline for a vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId/timeline
// @access  Private
exports.getVehicleTimeline = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 50 } = req.query;

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const maintenance = await Maintenance.find({ vehicle: vehicleId })
      .populate('technician', 'firstName lastName')
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit));

    // Group by year and month for timeline view
    const timeline = maintenance.reduce((acc, record) => {
      const date = new Date(record.scheduledDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[key]) {
        acc[key] = {
          month: key,
          records: [],
          totalCost: 0
        };
      }

      acc[key].records.push(record);
      if (record.status === 'completed') {
        acc[key].totalCost += record.totalCost || 0;
      }

      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        vehicle: {
          id: vehicle._id,
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model
        },
        timeline: Object.values(timeline).sort((a, b) => b.month.localeCompare(a.month))
      }
    });
  } catch (error) {
    console.error('Get vehicle timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle maintenance timeline',
      error: error.message
    });
  }
};

// @desc    Mark maintenance as completed
// @route   PUT /api/maintenance/:id/complete
// @access  Private
exports.completeMaintenance = async (req, res) => {
  try {
    const { completionDate, workPerformed, mileageAtService, totalCost } = req.body;

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    if (maintenance.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Maintenance is already completed'
      });
    }

    maintenance.status = 'completed';
    maintenance.completionDate = completionDate || new Date();
    maintenance.workPerformed = workPerformed;
    maintenance.mileageAtService = mileageAtService;
    if (totalCost) maintenance.totalCost = totalCost;
    maintenance.updatedBy = req.user._id;

    await maintenance.save();

    // Update vehicle status and maintenance schedule
    const vehicle = await Vehicle.findById(maintenance.vehicle);
    if (vehicle) {
      vehicle.status = 'active';

      // Update maintenance schedule
      const now = new Date();
      switch (maintenance.type) {
        case 'oil_change':
          vehicle.maintenanceSchedule.lastOilChange = now;
          vehicle.maintenanceSchedule.lastOilChangeMileage = mileageAtService || vehicle.currentMileage;
          break;
        case 'tire_rotation':
          vehicle.maintenanceSchedule.lastTireRotation = now;
          break;
        case 'brake_service':
          vehicle.maintenanceSchedule.lastBrakeCheck = now;
          break;
        case 'general_inspection':
          vehicle.maintenanceSchedule.lastGeneralInspection = now;
          break;
      }

      await vehicle.save();
    }

    const populatedMaintenance = await Maintenance.findById(maintenance._id)
      .populate('vehicle', 'plateNumber make model year')
      .populate('technician', 'firstName lastName');

    res.json({
      success: true,
      message: 'Maintenance marked as completed',
      data: populatedMaintenance
    });
  } catch (error) {
    console.error('Complete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing maintenance',
      error: error.message
    });
  }
};

// @desc    Get maintenance types for filter
// @route   GET /api/maintenance/filters/types
// @access  Private
exports.getMaintenanceTypes = async (req, res) => {
  try {
    const types = await Maintenance.distinct('type');
    res.json({
      success: true,
      data: types.sort()
    });
  } catch (error) {
    console.error('Get maintenance types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance types',
      error: error.message
    });
  }
};
