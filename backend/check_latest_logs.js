const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management')
  .then(async () => {
    console.log('Connected to DB');
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(5);
    console.log(JSON.stringify(logs, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
