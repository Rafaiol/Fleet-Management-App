const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
const Vehicle = require('./models/Vehicle');
const Maintenance = require('./models/Maintenance');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management')
  .then(async () => {
    console.log('Connected to DB');

    const logs = await ActivityLog.find({});
    let updatedCount = 0;

    for (let log of logs) {
      let needsSave = false;
      let newDesc = log.description;

      // Check if it's a vehicle log
      if (log.resourceType === 'Vehicle' && log.resourceId) {
        // Try to fetch vehicle or use previousState/newState
        let v = log.newState || log.previousState;
        if (!v) {
          v = await Vehicle.findById(log.resourceId);
        }

        if (v && v.make && v.model && v.plateNumber) {
          if (log.action === 'CREATE' && newDesc.startsWith('Created vehicle') && !newDesc.includes('(')) {
            newDesc = `Created vehicle ${v.make} ${v.model} (${v.plateNumber})`;
            needsSave = true;
          } else if (log.action === 'UPDATE' && newDesc.startsWith('Updated vehicle') && !newDesc.includes('(')) {
            newDesc = `Updated vehicle ${v.make} ${v.model} (${v.plateNumber})`;
            needsSave = true;
          } else if (log.action === 'DELETE' && newDesc.startsWith('Deleted vehicle') && !newDesc.includes('(')) {
            newDesc = `Deleted vehicle ${v.make} ${v.model} (${v.plateNumber})`;
            needsSave = true;
          }
        }
      }

      // Check if it's a maintenance log
      if (log.resourceType === 'Maintenance' && log.resourceId) {
        let m = log.newState || log.previousState;
        if (!m) {
          m = await Maintenance.findById(log.resourceId);
        }

        if (m) {
          let v = null;
          if (m.vehicle) {
            v = await Vehicle.findById(m.vehicle);
          }

          if (v && v.make) {
            const mType = m.type ? m.type.replace(/_/g, ' ') : '';
            const vString = `${v.make} ${v.model || ''} (${v.plateNumber || 'Unknown'})`.trim();

            if (log.action === 'CREATE' && newDesc.startsWith('Created maintenance') && !newDesc.includes('(')) {
              newDesc = `Created ${mType} maintenance record for ${vString}`;
              needsSave = true;
            } else if (log.action === 'UPDATE' && newDesc.startsWith('Updated maintenance') && !newDesc.includes('(')) {
              newDesc = `Updated ${mType} maintenance record for ${vString}`;
              needsSave = true;
            } else if (log.action === 'DELETE' && newDesc.startsWith('Deleted maintenance') && !newDesc.includes('(')) {
              newDesc = `Deleted ${mType} maintenance record for ${vString}`;
              needsSave = true;
            } else if (log.action === 'UPDATE' && newDesc.startsWith('Completed maintenance') && !newDesc.includes('(')) {
              newDesc = `Completed ${mType} maintenance record for ${vString}`;
              needsSave = true;
            }
          }
        }
      }

      // Check if it's an UNDO log
      if (log.description.startsWith('UNDID')) {
        if (!newDesc.includes('(')) {
          // Extremely naive backfill attempt if it's UNDID without details
          if (log.resourceType === 'Vehicle') {
            let v = log.newState || log.previousState;
            if (v && v.plateNumber) {
              newDesc = newDesc.replace(log.resourceType, `Vehicle ${v.make || ''} ${v.model || ''} (${v.plateNumber})`.trim());
              needsSave = true;
            }
          } else if (log.resourceType === 'Maintenance') {
            let m = log.newState || log.previousState;
            if (m && m.vehicle) {
              let v = await Vehicle.findById(m.vehicle);
              if (v && v.plateNumber) {
                const mType = m.type ? m.type.replace(/_/g, ' ') : '';
                const vString = `${v.make} ${v.model || ''} (${v.plateNumber || 'Unknown'})`.trim();
                newDesc = newDesc.replace(log.resourceType, `${mType} maintenance for ${vString}`);
                needsSave = true;
              }
            }
          }
        }
      }

      if (needsSave && log.description !== newDesc) {
        log.description = newDesc;
        await log.save();
        updatedCount++;
      }
    }

    console.log(`Finished migrating descriptions. Updated ${updatedCount} logs.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
