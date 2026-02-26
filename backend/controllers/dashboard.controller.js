const { Vehicle, Maintenance, User } = require('../models');
const { evaluateAllRules } = require('./alertRule.controller');

// @desc    Get dashboard overview data
// @route   GET /api/dashboard/overview
// @access  Private
exports.getOverview = async (req, res) => {
  try {
    // Vehicle statistics
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    const offlineVehicles = await Vehicle.countDocuments({ status: 'offline' });

    // Maintenance statistics
    const totalMaintenance = await Maintenance.countDocuments();
    const scheduledMaintenance = await Maintenance.countDocuments({ status: 'scheduled' });
    const inProgressMaintenance = await Maintenance.countDocuments({ status: 'in_progress' });
    const completedMaintenance = await Maintenance.countDocuments({ status: 'completed' });

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Recent activity
    const recentVehicles = await Vehicle.find()
      .select('plateNumber make model status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMaintenance = await Maintenance.find()
      .populate('vehicle', 'plateNumber make model')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming maintenance (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingMaintenance = await Maintenance.find({
      scheduledDate: { $gte: today, $lte: thirtyDaysFromNow },
      status: { $in: ['scheduled', 'in_progress'] }
    })
      .populate('vehicle', 'plateNumber make model')
      .sort({ scheduledDate: 1 })
      .limit(10);

    // Maintenance cost this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyCost = await Maintenance.aggregate([
      {
        $match: {
          status: 'completed',
          completionDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        vehicles: {
          total: totalVehicles,
          active: activeVehicles,
          maintenance: maintenanceVehicles,
          offline: offlineVehicles
        },
        maintenance: {
          total: totalMaintenance,
          scheduled: scheduledMaintenance,
          inProgress: inProgressMaintenance,
          completed: completedMaintenance
        },
        users: {
          total: totalUsers,
          active: activeUsers
        },
        monthlyCost: monthlyCost[0]?.total || 0,
        recentVehicles,
        recentMaintenance,
        upcomingMaintenance
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
};

// @desc    Get maintenance trends data
// @route   GET /api/dashboard/trends
// @access  Private
exports.getTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Get monthly maintenance data
    const monthlyData = await Maintenance.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalCost: { $sum: '$totalCost' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for charts
    const formattedData = monthlyData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count,
      completed: item.completed,
      cost: item.totalCost
    }));

    // Fill in missing months with zeros
    const filledData = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const existing = formattedData.find(d => d.month === monthKey);
      filledData.push(existing || {
        month: monthKey,
        count: 0,
        completed: 0,
        cost: 0
      });
      current.setMonth(current.getMonth() + 1);
    }

    res.json({
      success: true,
      data: filledData
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trends data',
      error: error.message
    });
  }
};

// @desc    Get vehicle status distribution
// @route   GET /api/dashboard/vehicle-status
// @access  Private
exports.getVehicleStatus = async (req, res) => {
  try {
    const statusData = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = statusData.map(item => ({
      status: item._id,
      count: item.count
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Get vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle status distribution',
      error: error.message
    });
  }
};

// @desc    Get maintenance by type distribution
// @route   GET /api/dashboard/maintenance-types
// @access  Private
exports.getMaintenanceTypes = async (req, res) => {
  try {
    const typeData = await Maintenance.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const formatted = typeData.map(item => ({
      type: item._id,
      count: item.count
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Get maintenance types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance types distribution',
      error: error.message
    });
  }
};

// @desc    Get cost analysis data
// @route   GET /api/dashboard/cost-analysis
// @access  Private
exports.getCostAnalysis = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);

    // Monthly costs
    const monthlyCosts = await Maintenance.aggregate([
      {
        $match: {
          status: 'completed',
          completionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completionDate' },
            month: { $month: '$completionDate' }
          },
          laborCost: { $sum: '$laborCost' },
          partsCost: { $sum: '$partsCost' },
          totalCost: { $sum: '$totalCost' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Cost by maintenance type
    const costByType = await Maintenance.aggregate([
      {
        $match: {
          status: 'completed',
          completionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalCost: -1 }
      }
    ]);

    // Cost by vehicle
    const costByVehicle = await Maintenance.aggregate([
      {
        $match: {
          status: 'completed',
          completionDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$vehicle',
          totalCost: { $sum: '$totalCost' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalCost: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate vehicle details
    const populatedCostByVehicle = await Vehicle.populate(costByVehicle, {
      path: '_id',
      select: 'plateNumber make model'
    });

    res.json({
      success: true,
      data: {
        monthlyCosts: monthlyCosts.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          laborCost: item.laborCost,
          partsCost: item.partsCost,
          totalCost: item.totalCost
        })),
        costByType: costByType.map(item => ({
          type: item._id,
          totalCost: item.totalCost,
          count: item.count
        })),
        costByVehicle: populatedCostByVehicle.map(item => ({
          vehicle: item._id,
          totalCost: item.totalCost,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Get cost analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cost analysis',
      error: error.message
    });
  }
};

// @desc    Get alerts and notifications
// @route   GET /api/dashboard/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();

    // Vehicles needing maintenance (overdue oil change)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const overdueMaintenance = await Vehicle.find({
      'maintenanceSchedule.lastOilChange': { $lt: threeMonthsAgo },
      status: { $ne: 'retired' }
    }).select('plateNumber make model maintenanceSchedule.lastOilChange');

    overdueMaintenance.forEach(vehicle => {
      alerts.push({
        type: 'maintenance_overdue',
        severity: 'warning',
        message: `Vehicle ${vehicle.plateNumber} is overdue for oil change`,
        vehicle: vehicle._id,
        plateNumber: vehicle.plateNumber,
        date: vehicle.maintenanceSchedule.lastOilChange
      });
    });

    // Upcoming registration expirations
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringRegistrations = await Vehicle.find({
      registrationExpiry: { $lte: thirtyDaysFromNow, $gte: now },
      status: { $ne: 'retired' }
    }).select('plateNumber make model registrationExpiry');

    expiringRegistrations.forEach(vehicle => {
      const daysUntil = Math.ceil((vehicle.registrationExpiry - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'registration_expiring',
        severity: daysUntil <= 7 ? 'urgent' : 'info',
        message: `Vehicle ${vehicle.plateNumber} registration expires in ${daysUntil} days`,
        vehicle: vehicle._id,
        plateNumber: vehicle.plateNumber,
        date: vehicle.registrationExpiry
      });
    });

    // Upcoming insurance expirations
    const expiringInsurance = await Vehicle.find({
      insuranceExpiry: { $lte: thirtyDaysFromNow, $gte: now },
      status: { $ne: 'retired' }
    }).select('plateNumber make model insuranceExpiry');

    expiringInsurance.forEach(vehicle => {
      const daysUntil = Math.ceil((vehicle.insuranceExpiry - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'insurance_expiring',
        severity: daysUntil <= 7 ? 'urgent' : 'info',
        message: `Vehicle ${vehicle.plateNumber} insurance expires in ${daysUntil} days`,
        vehicle: vehicle._id,
        plateNumber: vehicle.plateNumber,
        date: vehicle.insuranceExpiry
      });
    });

    // Scheduled maintenance in next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingMaintenance = await Maintenance.find({
      scheduledDate: { $gte: now, $lte: sevenDaysFromNow },
      status: 'scheduled'
    }).populate('vehicle', 'plateNumber make model');

    upcomingMaintenance.forEach(maintenance => {
      alerts.push({
        type: 'maintenance_scheduled',
        severity: 'info',
        message: `Scheduled maintenance for ${maintenance.vehicle.plateNumber} on ${maintenance.scheduledDate.toLocaleDateString()}`,
        vehicle: maintenance.vehicle._id,
        plateNumber: maintenance.vehicle.plateNumber,
        maintenance: maintenance._id,
        date: maintenance.scheduledDate
      });
    });

    // ── Custom Alert Rules ──
    try {
      const customAlerts = await evaluateAllRules();
      alerts.push(...customAlerts);
    } catch (ruleError) {
      console.error('Error evaluating custom alert rules:', ruleError);
      // Don't fail the whole endpoint if custom rules have an issue
    }

    // Sort alerts by severity and date
    const severityOrder = { urgent: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return a.date - b.date;
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};
