const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { Vehicle, Maintenance, User } = require('../models');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Helper function to generate HTML for vehicle report
const generateVehicleReportHTML = (vehicle, maintenanceHistory) => {
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
  const formatCurrency = (amount) => amount ? `$${amount.toFixed(2)}` : '$0.00';
  
  const maintenanceRows = maintenanceHistory.map(m => `
    <tr>
      <td>${formatDate(m.scheduledDate)}</td>
      <td>${m.type.replace(/_/g, ' ').toUpperCase()}</td>
      <td>${m.status}</td>
      <td>${m.description.substring(0, 50)}${m.description.length > 50 ? '...' : ''}</td>
      <td>${formatCurrency(m.totalCost)}</td>
    </tr>
  `).join('');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Vehicle Report - ${vehicle.plateNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header p {
      color: #6b7280;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .info-item {
      padding: 10px;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
    }
    .info-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-active { background: #dcfce7; color: #166534; }
    .status-maintenance { background: #fef3c7; color: #92400e; }
    .status-offline { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
    }
    .component-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .component-item {
      padding: 10px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FLEET MANAGEMENT SYSTEM</h1>
    <p>Vehicle Detailed Report</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <div class="section-title">Vehicle Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Plate Number</div>
        <div class="info-value">${vehicle.plateNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Make</div>
        <div class="info-value">${vehicle.make}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Model</div>
        <div class="info-value">${vehicle.model}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Year</div>
        <div class="info-value">${vehicle.year}</div>
      </div>
      <div class="info-item">
        <div class="info-label">VIN</div>
        <div class="info-value">${vehicle.vin || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">
          <span class="status-badge status-${vehicle.status}">${vehicle.status}</span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Current Mileage</div>
        <div class="info-value">${vehicle.currentMileage.toLocaleString()} ${vehicle.mileageUnit}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Fuel Type</div>
        <div class="info-value">${vehicle.fuelType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Body Type</div>
        <div class="info-value">${vehicle.bodyType}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Registration & Insurance</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Registration Date</div>
        <div class="info-value">${formatDate(vehicle.registrationDate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Registration Expiry</div>
        <div class="info-value">${formatDate(vehicle.registrationExpiry)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Insurance Number</div>
        <div class="info-value">${vehicle.insuranceNumber || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Insurance Expiry</div>
        <div class="info-value">${formatDate(vehicle.insuranceExpiry)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Component Status</div>
    <div class="component-grid">
      <div class="component-item">
        <strong>Battery:</strong> ${vehicle.components?.battery?.condition || 'Unknown'}
        <br><small>Last Replaced: ${formatDate(vehicle.components?.battery?.lastReplaced)}</small>
      </div>
      <div class="component-item">
        <strong>Distribution Chain:</strong> ${vehicle.components?.distributionChain?.condition || 'Unknown'}
        <br><small>Last Replaced: ${formatDate(vehicle.components?.distributionChain?.lastReplaced)}</small>
      </div>
      <div class="component-item">
        <strong>Engine Belt:</strong> ${vehicle.components?.engineBelt?.condition || 'Unknown'}
        <br><small>Last Replaced: ${formatDate(vehicle.components?.engineBelt?.lastReplaced)}</small>
      </div>
      <div class="component-item">
        <strong>Brake Fluid:</strong> ${vehicle.components?.brakeFluid?.condition || 'Unknown'}
        <br><small>Last Changed: ${formatDate(vehicle.components?.brakeFluid?.lastChanged)}</small>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Maintenance History</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Status</th>
          <th>Description</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        ${maintenanceRows || '<tr><td colspan="5" style="text-align: center;">No maintenance records found</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Fleet Management System - Confidential Report</p>
    <p>Page 1 of 1</p>
  </div>
</body>
</html>
  `;
};

// Helper function to generate HTML for maintenance report
const generateMaintenanceReportHTML = (maintenance) => {
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
  const formatCurrency = (amount) => amount ? `$${amount.toFixed(2)}` : '$0.00';
  
  const partsRows = maintenance.partsUsed?.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.partNumber || 'N/A'}</td>
      <td>${p.quantity}</td>
      <td>${formatCurrency(p.unitPrice)}</td>
      <td>${formatCurrency(p.totalPrice)}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align: center;">No parts used</td></tr>';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Maintenance Report - ${maintenance.vehicle?.plateNumber || 'Unknown'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 5px;
    }
    .header p {
      color: #6b7280;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .info-item {
      padding: 10px;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
    }
    .info-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-scheduled { background: #dbeafe; color: #1e40af; }
    .status-in_progress { background: #fef3c7; color: #92400e; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .priority-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .priority-low { background: #dcfce7; color: #166534; }
    .priority-medium { background: #dbeafe; color: #1e40af; }
    .priority-high { background: #fef3c7; color: #92400e; }
    .priority-urgent { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
    }
    .cost-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .cost-item {
      padding: 15px;
      background: #f0f9ff;
      border: 2px solid #2563eb;
      text-align: center;
    }
    .cost-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .cost-value {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
    }
    .description-box {
      padding: 15px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FLEET MANAGEMENT SYSTEM</h1>
    <p>Maintenance Report</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <div class="section-title">Vehicle Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Plate Number</div>
        <div class="info-value">${maintenance.vehicle?.plateNumber || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Make</div>
        <div class="info-value">${maintenance.vehicle?.make || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Model</div>
        <div class="info-value">${maintenance.vehicle?.model || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Maintenance Details</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Maintenance Type</div>
        <div class="info-value">${maintenance.type?.replace(/_/g, ' ').toUpperCase()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">
          <span class="status-badge status-${maintenance.status}">${maintenance.status?.replace(/_/g, ' ')}</span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Priority</div>
        <div class="info-value">
          <span class="priority-badge priority-${maintenance.priority}">${maintenance.priority}</span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Scheduled Date</div>
        <div class="info-value">${formatDate(maintenance.scheduledDate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Completion Date</div>
        <div class="info-value">${formatDate(maintenance.completionDate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Mileage at Service</div>
        <div class="info-value">${maintenance.mileageAtService?.toLocaleString() || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Service Provider</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Provider Name</div>
        <div class="info-value">${maintenance.serviceProvider?.name || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Phone</div>
        <div class="info-value">${maintenance.serviceProvider?.phone || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${maintenance.serviceProvider?.email || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Description</div>
    <div class="description-box">
      ${maintenance.description || 'No description provided'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Work Performed</div>
    <div class="description-box">
      ${maintenance.workPerformed || 'Work not yet completed'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Parts Used</div>
    <table>
      <thead>
        <tr>
          <th>Part Name</th>
          <th>Part Number</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${partsRows}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Cost Summary</div>
    <div class="cost-summary">
      <div class="cost-item">
        <div class="cost-label">Labor Cost</div>
        <div class="cost-value">${formatCurrency(maintenance.laborCost)}</div>
      </div>
      <div class="cost-item">
        <div class="cost-label">Parts Cost</div>
        <div class="cost-value">${formatCurrency(maintenance.partsCost)}</div>
      </div>
      <div class="cost-item">
        <div class="cost-label">Total Cost</div>
        <div class="cost-value">${formatCurrency(maintenance.totalCost)}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Fleet Management System - Maintenance Report</p>
    <p>Report ID: ${maintenance._id}</p>
  </div>
</body>
</html>
  `;
};

// @desc    Generate vehicle report PDF
// @route   GET /api/reports/vehicle/:id
// @access  Private
exports.generateVehicleReport = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('assignedDriver', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Get maintenance history
    const maintenanceHistory = await Maintenance.find({ vehicle: vehicle._id })
      .populate('technician', 'firstName lastName')
      .sort({ scheduledDate: -1 });
    
    // Generate HTML
    const html = generateVehicleReportHTML(vehicle, maintenanceHistory);
    
    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const filename = `vehicle-report-${vehicle.plateNumber}-${Date.now()}.pdf`;
    const filepath = path.join(reportsDir, filename);
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    // Send file
    res.download(filepath, `Vehicle-Report-${vehicle.plateNumber}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('File cleanup error:', err);
        });
      }, 60000); // Delete after 1 minute
    });
  } catch (error) {
    console.error('Generate vehicle report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating vehicle report',
      error: error.message
    });
  }
};

// @desc    Generate maintenance report PDF
// @route   GET /api/reports/maintenance/:id
// @access  Private
exports.generateMaintenanceReport = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('vehicle', 'plateNumber make model year')
      .populate('technician', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    // Generate HTML
    const html = generateMaintenanceReportHTML(maintenance);
    
    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const filename = `maintenance-report-${maintenance._id}-${Date.now()}.pdf`;
    const filepath = path.join(reportsDir, filename);
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    // Send file
    res.download(filepath, `Maintenance-Report-${maintenance.vehicle?.plateNumber || 'Unknown'}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('File cleanup error:', err);
        });
      }, 60000);
    });
  } catch (error) {
    console.error('Generate maintenance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating maintenance report',
      error: error.message
    });
  }
};

// @desc    Generate fleet summary report
// @route   GET /api/reports/fleet-summary
// @access  Private (Admin only)
exports.generateFleetSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.scheduledDate = {};
      if (startDate) dateFilter.scheduledDate.$gte = new Date(startDate);
      if (endDate) dateFilter.scheduledDate.$lte = new Date(endDate);
    }
    
    // Get statistics
    const totalVehicles = await Vehicle.countDocuments();
    const vehiclesByStatus = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const totalMaintenance = await Maintenance.countDocuments(dateFilter);
    const maintenanceCost = await Maintenance.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);
    
    const maintenanceByType = await Maintenance.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$type', count: { $sum: 1 }, cost: { $sum: '$totalCost' } } },
      { $sort: { count: -1 } }
    ]);
    
    // Generate HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fleet Summary Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 5px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      padding: 20px;
      background: #f0f9ff;
      border: 2px solid #2563eb;
      text-align: center;
    }
    .summary-value {
      font-size: 28px;
      font-weight: bold;
      color: #1e40af;
    }
    .summary-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      background: #2563eb;
      color: white;
      padding: 8px 12px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 10px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>FLEET MANAGEMENT SYSTEM</h1>
    <p>Fleet Summary Report</p>
    <p>Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'All time'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${totalVehicles}</div>
      <div class="summary-label">Total Vehicles</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${totalMaintenance}</div>
      <div class="summary-label">Maintenance Records</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">$${(maintenanceCost[0]?.total || 0).toFixed(2)}</div>
      <div class="summary-label">Total Maintenance Cost</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${maintenanceByType.length}</div>
      <div class="summary-label">Maintenance Types</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Vehicles by Status</div>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${vehiclesByStatus.map(v => `
          <tr>
            <td>${v._id}</td>
            <td>${v.count}</td>
            <td>${((v.count / totalVehicles) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Maintenance by Type</div>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Count</th>
          <th>Total Cost</th>
        </tr>
      </thead>
      <tbody>
        ${maintenanceByType.map(m => `
          <tr>
            <td>${m._id.replace(/_/g, ' ').toUpperCase()}</td>
            <td>${m.count}</td>
            <td>$${m.cost.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Fleet Management System - Confidential Report</p>
  </div>
</body>
</html>
    `;
    
    // Generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const filename = `fleet-summary-report-${Date.now()}.pdf`;
    const filepath = path.join(reportsDir, filename);
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    // Send file
    res.download(filepath, `Fleet-Summary-Report.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      setTimeout(() => {
        fs.unlink(filepath, (err) => {
          if (err) console.error('File cleanup error:', err);
        });
      }, 60000);
    });
  } catch (error) {
    console.error('Generate fleet summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating fleet summary report',
      error: error.message
    });
  }
};
