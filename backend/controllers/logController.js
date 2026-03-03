const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Ensure reports directory exists for temporary PDF artifacts if needed, though here we stream buffer directly
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// HTML Generator for PDF export
const generateLogsReportHTML = (logs) => {
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';

  const logRows = logs.map(log => {
    const user = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System';
    let status = 'Normal';
    let statusClass = 'status-normal';

    if (log.undone) {
      status = 'Reverted';
      statusClass = 'status-reverted';
    }
    if (log.description && log.description.startsWith('UNDID')) {
      status = 'Audit Record';
      statusClass = 'status-audit';
    }

    return `
    <tr>
      <td>${formatDate(log.createdAt)}</td>
      <td>${user}</td>
      <td><span class="action-badge action-${log.action.toLowerCase()}">${log.action}</span></td>
      <td>${log.resourceType}</td>
      <td>${log.description}</td>
      <td><span class="status-badge ${statusClass}">${status}</span></td>
    </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Activity Logs Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #333;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
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
    .status-normal { background: #f3f4f6; color: #4b5563; }
    .status-reverted { background: #fee2e2; color: #991b1b; }
    .status-audit { background: #dcfce7; color: #166534; }
    
    .action-badge {
      font-weight: bold;
      font-size: 11px;
    }
    .action-create { color: #059669; }
    .action-update { color: #2563eb; }
    .action-delete { color: #e11d48; }
    .action-export { color: #7c3aed; }
    
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
    <p>Activity Logs Full History Report</p>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date & Time</th>
        <th>User</th>
        <th>Action</th>
        <th>Resource</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${logRows || '<tr><td colspan="6" style="text-align: center;">No activity logs found</td></tr>'}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Fleet Management System - Confidential Report</p>
    <p>Page 1 of 1</p>
  </div>
</body>
</html>
  `;
};

// Helper generic way to reconstruct models dynamically based on resourceType for Undos
const modelMap = {
  Vehicle: require('../models/Vehicle'),
  Maintenance: require('../models/Maintenance'),
  AlertRule: require('../models/AlertRule'),
  User: require('../models/User'),
};

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};

    // Filtering
    if (req.query.action) query.action = req.query.action;
    if (req.query.resourceType) query.resourceType = req.query.resourceType;
    if (req.query.userId) query.user = req.query.userId;

    // Search by description
    if (req.query.search) {
      query.description = { $regex: req.query.search, $options: 'i' };
    }

    const total = await ActivityLog.countDocuments(query);

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'firstName lastName email role');

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
};

// @desc    Undo an action
// @route   POST /api/logs/:id/undo
// @access  Private/Admin
const undoAction = async (req, res) => {
  try {
    const logId = req.params.id;
    const log = await ActivityLog.findById(logId);

    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    // Prevent undoing an already-undone action
    if (log.undone) {
      return res.status(400).json({ message: 'This action has already been undone.' });
    }

    if (log.action === 'CREATE') {
      return res.status(400).json({ message: 'Cannot undo a CREATE action directly yet. Just delete the resource.' });
    }

    if (log.action === 'EXPORT') {
      return res.status(400).json({ message: 'Cannot undo an EXPORT action.' });
    }

    const Model = modelMap[log.resourceType];
    if (!Model) {
      return res.status(400).json({ message: `Cannot undo actions for resource type: ${log.resourceType}` });
    }

    if (log.action === 'DELETE') {
      // Re-insert the document exactly as it was
      if (!log.previousState) {
        return res.status(400).json({ message: 'No previous state found to restore.' });
      }

      // Strip internal MongoDB/Mongoose fields that would conflict
      const { _id, __v, createdAt, updatedAt, id, ...restoreData } = log.previousState;

      let restoredDoc;
      try {
        // Try to restore with original ID to keep relationships intact
        const docWithId = new Model({ ...restoreData, _id: log.previousState._id });
        await docWithId.save({ validateBeforeSave: false });
        restoredDoc = docWithId;
      } catch (saveErr) {
        // If that fails (e.g. duplicate key), create without original _id
        restoredDoc = await Model.create(restoreData);
      }

      let detailStr = log.resourceType;
      if (log.resourceType === 'Vehicle') {
        detailStr = `Vehicle ${restoredDoc.make || ''} ${restoredDoc.model || ''} (${restoredDoc.plateNumber || ''})`.trim();
      } else if (log.resourceType === 'Maintenance') {
        const VehicleModel = require('../models/Vehicle');
        const v = await VehicleModel.findById(restoredDoc.vehicle);
        const vStr = v ? `${v.make} ${v.model} (${v.plateNumber})` : 'Unknown Vehicle';
        detailStr = `${restoredDoc.type ? restoredDoc.type.replace(/_/g, ' ') : ''} maintenance for ${vStr}`.trim();
      }

      // Log the undo — mark as undone:true so no Undo button appears on this entry
      await ActivityLog.create({
        user: req.user._id,
        action: 'CREATE',
        resourceType: log.resourceType,
        resourceId: restoredDoc._id,
        description: `UNDID DELETION: Restored ${detailStr}`,
        newState: restoredDoc.toObject(),
        undone: true,
      });

      // Mark original log as undone so its Undo button disappears
      log.undone = true;
      await log.save();
      console.log(`Log ${logId} marked as undone (DELETE case)`);

    } else if (log.action === 'UPDATE') {
      // Revert the document to the previous state
      if (!log.previousState) {
        return res.status(400).json({ message: 'No previous state found to revert to.' });
      }

      // Strip internal MongoDB/Mongoose fields that should not be overwritten
      const { _id, __v, createdAt, updatedAt, id, ...revertData } = log.previousState;

      const updatedDoc = await Model.findByIdAndUpdate(
        log.resourceId,
        { $set: revertData },
        { new: true }
      );

      if (!updatedDoc) {
        return res.status(404).json({ message: 'Original document was not found. It may have been deleted.' });
      }

      let detailStr = log.resourceType;
      if (log.resourceType === 'Vehicle') {
        detailStr = `Vehicle ${updatedDoc.make || ''} ${updatedDoc.model || ''} (${updatedDoc.plateNumber || ''})`.trim();
      } else if (log.resourceType === 'Maintenance') {
        const VehicleModel = require('../models/Vehicle');
        const v = await VehicleModel.findById(updatedDoc.vehicle);
        const vStr = v ? `${v.make} ${v.model} (${v.plateNumber})` : 'Unknown Vehicle';
        detailStr = `${updatedDoc.type ? updatedDoc.type.replace(/_/g, ' ') : ''} maintenance for ${vStr}`.trim();
      }

      // Log the undo — mark as undone:true so no Undo button appears on this entry
      await ActivityLog.create({
        user: req.user._id,
        action: 'UPDATE',
        resourceType: log.resourceType,
        resourceId: updatedDoc._id,
        description: `UNDID UPDATE: Reverted ${detailStr} to previous state`,
        previousState: log.newState,
        newState: updatedDoc.toObject(),
        undone: true,
      });

      // Mark original log as undone so its Undo button disappears
      log.undone = true;
      await log.save();
      console.log(`Log ${logId} marked as undone (UPDATE case)`);
    }

    res.json({ message: 'Undo successful' });
  } catch (error) {
    console.error('Error undoing action:', error);
    res.status(500).json({ message: 'Server error processing undo' });
  }
};

// @desc    Delete all activity logs
// @route   DELETE /api/logs
// @access  Private/Admin
const deleteAllLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});

    // Create an audit trail entry for this mass deletion itself
    // We do this so there's a record that the logs were cleared
    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE',
      resourceType: 'Report',
      description: 'CLEARED ALL ACTIVITY LOGS',
    });

    res.json({ message: 'All activity logs have been deleted successfully.' });
  } catch (error) {
    console.error('Error deleting all logs:', error);
    res.status(500).json({ message: 'Server error deleting activity logs' });
  }
};

// @desc    Export all activity logs to PDF
// @route   GET /api/logs/export
// @access  Private/Admin
const exportLogs = async (req, res) => {
  let browser;
  try {
    // Determine filters if any are passed
    const query = {};
    if (req.query.action) query.action = req.query.action;
    if (req.query.resourceType) query.resourceType = req.query.resourceType;
    if (req.query.search) {
      query.description = { $regex: req.query.search, $options: 'i' };
    }

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');

    if (logs.length === 0) {
      return res.status(404).json({ message: 'No logs found to export' });
    }

    const html = generateLogsReportHTML(logs);

    browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.pdf"');

    // Log the export action
    await ActivityLog.create({
      user: req.user._id,
      action: 'EXPORT',
      resourceType: 'Report',
      description: 'Exported activity logs to PDF',
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ message: 'Server error exporting activity logs' });
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = {
  getLogs,
  undoAction,
  deleteAllLogs,
  exportLogs,
};
