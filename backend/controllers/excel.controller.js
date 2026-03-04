const XLSX = require('xlsx');
const Vehicle = require('../models/Vehicle');
const Maintenance = require('../models/Maintenance');
const translations = require('../utils/translations');

const t = (lang, key) => {
  const tr = translations[lang] || translations.en;
  return tr[key] || translations.en[key] || key;
};

// ─── Fleet Summary Excel ─────────────────────────────────────────────────────
const generateFleetSummaryExcel = async (req, res) => {
  const lang = req.query.lang || 'en';
  try {
    const [vehicles, maintenanceRecords] = await Promise.all([
      Vehicle.find().lean(),
      Maintenance.find().populate('vehicle', 'plateNumber make model').lean(),
    ]);

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Vehicles ──────────────────────────────────────────────────
    const vehicleHeaders = [
      t(lang, 'plateNumber'),
      t(lang, 'make'),
      t(lang, 'model'),
      t(lang, 'year'),
      t(lang, 'status'),
      t(lang, 'fuelType'),
      t(lang, 'bodyType'),
      t(lang, 'currentMileage'),
      t(lang, 'registrationExpiry'),
      t(lang, 'insuranceExpiry'),
    ];
    const vehicleData = vehicles.map(v => [
      v.plateNumber || '',
      v.make || '',
      v.model || '',
      v.year || '',
      v.status || '',
      v.fuelType || '',
      v.bodyType || '',
      v.currentMileage || 0,
      v.registrationExpiry ? new Date(v.registrationExpiry).toLocaleDateString() : '',
      v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString() : '',
    ]);
    const ws1 = XLSX.utils.aoa_to_sheet([vehicleHeaders, ...vehicleData]);
    XLSX.utils.book_append_sheet(wb, ws1, t(lang, 'totalVehicles'));

    // ── Sheet 2: Maintenance ────────────────────────────────────────────────
    const maintHeaders = [
      t(lang, 'plateNumber'),
      t(lang, 'maintenanceType'),
      t(lang, 'status'),
      t(lang, 'priority'),
      t(lang, 'scheduledDate'),
      t(lang, 'laborCost'),
      t(lang, 'partsCost'),
      t(lang, 'totalCost'),
      t(lang, 'description'),
    ];
    const maintData = maintenanceRecords.map(m => {
      const veh = m.vehicle;
      return [
        veh ? veh.plateNumber : '',
        m.type || '',
        m.status || '',
        m.priority || '',
        m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : '',
        m.laborCost || 0,
        m.partsCost || 0,
        m.totalCost || 0,
        m.description || '',
      ];
    });
    const ws2 = XLSX.utils.aoa_to_sheet([maintHeaders, ...maintData]);
    XLSX.utils.book_append_sheet(wb, ws2, t(lang, 'maintenanceRecords'));

    // ── Generate Buffer ─────────────────────────────────────────────────────
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Fleet-Summary-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ message: 'Error generating Excel report' });
  }
};

// ─── Vehicles Activity Excel ─────────────────────────────────────────────────
const generateVehiclesExcel = async (req, res) => {
  const lang = req.query.lang || 'en';
  const { startDate, endDate } = req.query;
  try {
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const vehicles = await Vehicle.find(query).lean();

    const headers = [
      t(lang, 'plateNumber'),
      t(lang, 'make'),
      t(lang, 'model'),
      t(lang, 'year'),
      t(lang, 'status'),
      t(lang, 'fuelType'),
      t(lang, 'bodyType'),
      t(lang, 'currentMileage'),
      t(lang, 'vin'),
      t(lang, 'registrationDate'),
      t(lang, 'registrationExpiry'),
      t(lang, 'insuranceNumber'),
      t(lang, 'insuranceExpiry'),
    ];
    const rows = vehicles.map(v => [
      v.plateNumber || '',
      v.make || '',
      v.model || '',
      v.year || '',
      v.status || '',
      v.fuelType || '',
      v.bodyType || '',
      v.currentMileage || 0,
      v.vin || '',
      v.registrationDate ? new Date(v.registrationDate).toLocaleDateString() : '',
      v.registrationExpiry ? new Date(v.registrationExpiry).toLocaleDateString() : '',
      v.insuranceNumber || '',
      v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString() : '',
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, t(lang, 'vehicleActivity'));

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Vehicles-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Excel vehicles error:', err);
    res.status(500).json({ message: 'Error generating Excel report' });
  }
};

// ─── Maintenance Activity Excel ──────────────────────────────────────────────
const generateMaintenanceExcel = async (req, res) => {
  const lang = req.query.lang || 'en';
  const { startDate, endDate } = req.query;
  try {
    let query = {};
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    const records = await Maintenance.find(query)
      .populate('vehicle', 'plateNumber make model')
      .lean();

    const headers = [
      t(lang, 'plateNumber'),
      t(lang, 'make'),
      t(lang, 'model'),
      t(lang, 'maintenanceType'),
      t(lang, 'status'),
      t(lang, 'priority'),
      t(lang, 'scheduledDate'),
      t(lang, 'completionDate'),
      t(lang, 'laborCost'),
      t(lang, 'partsCost'),
      t(lang, 'totalCost'),
      t(lang, 'description'),
    ];
    const rows = records.map(m => {
      const veh = m.vehicle;
      return [
        veh ? veh.plateNumber : '',
        veh ? veh.make : '',
        veh ? veh.model : '',
        m.type || '',
        m.status || '',
        m.priority || '',
        m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : '',
        m.completionDate ? new Date(m.completionDate).toLocaleDateString() : '',
        m.laborCost || 0,
        m.partsCost || 0,
        m.totalCost || 0,
        m.description || '',
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, t(lang, 'maintenanceActivity'));

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Maintenance-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Excel maintenance error:', err);
    res.status(500).json({ message: 'Error generating Excel report' });
  }
};

module.exports = {
  generateFleetSummaryExcel,
  generateVehiclesExcel,
  generateMaintenanceExcel,
};
