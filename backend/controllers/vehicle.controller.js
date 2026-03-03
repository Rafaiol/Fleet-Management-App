const { validationResult } = require('express-validator');
const { Vehicle, Maintenance, ActivityLog } = require('../models');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getAllVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      make,
      fuelType,
      bodyType,
      yearFrom,
      yearTo,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { plateNumber: { $regex: escapedSearch, $options: 'i' } },
        { make: { $regex: escapedSearch, $options: 'i' } },
        { model: { $regex: escapedSearch, $options: 'i' } },
        { vin: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (make) {
      const escapedMake = make.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.make = { $regex: escapedMake, $options: 'i' };
    }
    if (fuelType) query.fuelType = fuelType;
    if (bodyType) query.bodyType = bodyType;
    if (yearFrom || yearTo) {
      query.year = {};
      if (yearFrom) query.year.$gte = parseInt(yearFrom);
      if (yearTo) query.year.$lte = parseInt(yearTo);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const vehicles = await Vehicle.find(query)
      .populate('assignedDriver', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('assignedDriver', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get maintenance history
    const maintenanceHistory = await Maintenance.find({ vehicle: vehicle._id })
      .populate('technician', 'firstName lastName')
      .sort({ scheduledDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        vehicle,
        maintenanceHistory
      }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin only)
exports.createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const vehicleData = { ...req.body, createdBy: req.user._id };

    const vehicle = await Vehicle.create(vehicleData);

    // Track activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE',
      resourceType: 'Vehicle',
      resourceId: vehicle._id,
      description: `Created vehicle ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
      newState: vehicle.toObject(),
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin only)
exports.updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Sanitize populated fields
    const updateData = { ...req.body, updatedBy: req.user._id };

    // Strip immutable fields from the update payload
    delete updateData.createdBy;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.assignedDriver && typeof updateData.assignedDriver === 'object' && updateData.assignedDriver._id) {
      updateData.assignedDriver = updateData.assignedDriver._id;
    }

    const oldVehicle = await Vehicle.findById(req.params.id);
    if (!oldVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Track activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE',
      resourceType: 'Vehicle',
      resourceId: vehicle._id,
      description: `Updated vehicle ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
      previousState: oldVehicle.toObject(),
      newState: vehicle.toObject(),
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin only)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle has maintenance records
    const maintenanceCount = await Maintenance.countDocuments({ vehicle: vehicle._id });
    if (maintenanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete vehicle with ${maintenanceCount} maintenance records. Please delete maintenance records first.`
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    // Track activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE',
      resourceType: 'Vehicle',
      resourceId: vehicle._id,
      description: `Deleted vehicle ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
      previousState: vehicle.toObject(),
    });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
};

// @desc    Get vehicle statistics
// @route   GET /api/vehicles/stats/overview
// @access  Private
exports.getVehicleStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    const offlineVehicles = await Vehicle.countDocuments({ status: 'offline' });
    const retiredVehicles = await Vehicle.countDocuments({ status: 'retired' });

    const vehiclesByMake = await Vehicle.aggregate([
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const vehiclesByStatus = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const vehiclesByFuelType = await Vehicle.aggregate([
      { $group: { _id: '$fuelType', count: { $sum: 1 } } }
    ]);

    // Get vehicles needing maintenance (oil change due)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const vehiclesNeedingMaintenance = await Vehicle.countDocuments({
      'maintenanceSchedule.lastOilChange': { $lt: threeMonthsAgo },
      status: { $ne: 'retired' }
    });

    // Get upcoming registration/insurance expirations
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingExpirations = await Vehicle.find({
      $or: [
        { registrationExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() } },
        { insuranceExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() } }
      ]
    }).select('plateNumber make model registrationExpiry insuranceExpiry');

    res.json({
      success: true,
      data: {
        total: totalVehicles,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        offline: offlineVehicles,
        retired: retiredVehicles,
        byMake: vehiclesByMake,
        byStatus: vehiclesByStatus,
        byFuelType: vehiclesByFuelType,
        needingMaintenance: vehiclesNeedingMaintenance,
        upcomingExpirations: upcomingExpirations.length
      }
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle statistics',
      error: error.message
    });
  }
};

// @desc    Get vehicle makes for filter
// @route   GET /api/vehicles/filters/makes
// @access  Private
exports.getVehicleMakes = async (req, res) => {
  try {
    const makes = await Vehicle.distinct('make');
    res.json({
      success: true,
      data: makes.sort()
    });
  } catch (error) {
    console.error('Get vehicle makes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle makes',
      error: error.message
    });
  }
};

// @desc    Update vehicle mileage
// @route   PUT /api/vehicles/:id/mileage
// @access  Private
exports.updateMileage = async (req, res) => {
  try {
    const { mileage } = req.body;

    if (!mileage || mileage < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid mileage is required'
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (mileage < vehicle.currentMileage) {
      return res.status(400).json({
        success: false,
        message: 'New mileage cannot be less than current mileage'
      });
    }

    vehicle.currentMileage = mileage;
    vehicle.updatedBy = req.user._id;
    await vehicle.save();

    res.json({
      success: true,
      message: 'Mileage updated successfully',
      data: { currentMileage: vehicle.currentMileage }
    });
  } catch (error) {
    console.error('Update mileage error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mileage',
      error: error.message
    });
  }
};

// @desc    Get vehicles needing maintenance
// @route   GET /api/vehicles/maintenance/due
// @access  Private
exports.getVehiclesNeedingMaintenance = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(days));

    // Find vehicles with overdue or upcoming maintenance
    const vehicles = await Vehicle.find({
      $or: [
        { 'maintenanceSchedule.lastOilChange': { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
        { registrationExpiry: { $lte: targetDate } },
        { insuranceExpiry: { $lte: targetDate } },
        { 'components.battery.nextReplacementDate': { $lte: targetDate } },
        { 'components.distributionChain.nextReplacementDate': { $lte: targetDate } },
        { 'components.engineBelt.nextReplacementDate': { $lte: targetDate } },
        { 'components.brakeFluid.nextChangeDate': { $lte: targetDate } },
        { 'components.coolant.nextChangeDate': { $lte: targetDate } }
      ],
      status: { $ne: 'retired' }
    }).populate('assignedDriver', 'firstName lastName');

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles needing maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles needing maintenance',
      error: error.message
    });
  }
};
