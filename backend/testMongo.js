const mongoose = require('mongoose');
require('dotenv').config();
const Maintenance = require('./models/Maintenance');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const search = '202';
    const res = await Maintenance.find({
      $expr: {
        $regexMatch: {
          input: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledDate', onNull: '' } },
          regex: search,
          options: 'i'
        }
      }
    });
    console.log('Matches found:', res.length);
  } catch (e) {
    console.error('MongoDB Error:', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
