const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Vehicle, Maintenance } = require('../models');

dotenv.config();

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@fleet.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 555-0100',
    department: 'Management',
    isActive: true
  },
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@fleet.com',
    password: 'user123',
    role: 'user',
    phone: '+1 555-0101',
    department: 'Operations',
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@fleet.com',
    password: 'user123',
    role: 'user',
    phone: '+1 555-0102',
    department: 'Maintenance',
    isActive: true
  },
  {
    firstName: 'Mike',
    lastName: 'Technician',
    email: 'mike.tech@fleet.com',
    password: 'tech123',
    role: 'technicien',
    phone: '+1 555-0103',
    department: 'Maintenance',
    isActive: true
  },
  {
    firstName: 'Lisa',
    lastName: 'Williams',
    email: 'lisa.williams@fleet.com',
    password: 'user123',
    role: 'user',
    phone: '+1 555-0104',
    department: 'Logistics',
    isActive: true
  }
];

const vehicleMakes = ['Toyota', 'Ford', 'Mercedes-Benz', 'Volkswagen', 'BMW', 'Honda', 'Nissan', 'Chevrolet'];
const vehicleModels = {
  'Toyota': ['Camry', 'Corolla', 'Hilux', 'Land Cruiser', 'Hiace'],
  'Ford': ['F-150', 'Transit', 'Focus', 'Explorer', 'Ranger'],
  'Mercedes-Benz': ['Sprinter', 'Actros', 'C-Class', 'E-Class', 'Vito'],
  'Volkswagen': ['Transporter', 'Crafter', 'Passat', 'Golf', 'Amarok'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X7'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Ridgeline'],
  'Nissan': ['Altima', 'Sentra', 'Navara', 'Pathfinder', 'NV350'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Traverse', 'Express']
};

const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
const bodyTypes = ['sedan', 'suv', 'truck', 'van', 'bus'];
const statuses = ['active', 'maintenance', 'offline'];
const maintenanceTypes = [
  'oil_change', 'tire_rotation', 'brake_service', 'battery_replacement',
  'chain_replacement', 'belt_replacement', 'brake_fluid_change', 'coolant_change',
  'general_inspection', 'engine_repair', 'transmission_repair', 'electrical_repair'
];

// Generate random vehicles
const generateVehicles = (count, userIds) => {
  const vehicles = [];
  
  for (let i = 0; i < count; i++) {
    const make = vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)];
    const model = vehicleModels[make][Math.floor(Math.random() * vehicleModels[make].length)];
    const year = 2018 + Math.floor(Math.random() * 7); // 2018-2024
    const platePrefix = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const plateNumber = `${platePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const registrationDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const registrationExpiry = new Date(registrationDate);
    registrationExpiry.setFullYear(registrationExpiry.getFullYear() + 1);
    
    const insuranceExpiry = new Date();
    insuranceExpiry.setMonth(insuranceExpiry.getMonth() + Math.floor(Math.random() * 12));
    
    const lastOilChange = new Date();
    lastOilChange.setMonth(lastOilChange.getMonth() - Math.floor(Math.random() * 4));
    
    vehicles.push({
      plateNumber,
      make,
      model,
      year,
      vin: `VIN${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      color: ['White', 'Black', 'Silver', 'Blue', 'Red', 'Gray'][Math.floor(Math.random() * 6)],
      bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
      fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      transmission: Math.random() > 0.5 ? 'automatic' : 'manual',
      engineSize: [1.6, 2.0, 2.5, 3.0, 3.5, 4.0][Math.floor(Math.random() * 6)],
      registrationDate,
      registrationExpiry,
      insuranceNumber: `INS-${Math.floor(100000 + Math.random() * 900000)}`,
      insuranceExpiry,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      currentMileage: Math.floor(10000 + Math.random() * 150000),
      mileageUnit: 'km',
      maintenanceSchedule: {
        oilChangeInterval: 5000,
        lastOilChange,
        lastOilChangeMileage: Math.floor(5000 + Math.random() * 50000),
        tireRotationInterval: 10000,
        brakeCheckInterval: 15000,
        generalInspectionInterval: 6
      },
      components: {
        battery: {
          lastReplaced: new Date(Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)),
          condition: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)],
          nextReplacementDate: new Date(Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
        },
        brakeFluid: {
          lastChanged: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
          condition: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)],
          nextChangeDate: new Date(Date.now() + Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000))
        },
        coolant: {
          lastChanged: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
          condition: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)],
          nextChangeDate: new Date(Date.now() + Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000))
        }
      },
      purchasePrice: Math.floor(15000 + Math.random() * 85000),
      notes: `Sample vehicle ${i + 1} - ${make} ${model}`,
      createdBy: userIds[Math.floor(Math.random() * userIds.length)]
    });
  }
  
  return vehicles;
};

// Generate random maintenance records
const generateMaintenanceRecords = (count, vehicleIds, userIds) => {
  const records = [];
  
  for (let i = 0; i < count; i++) {
    const vehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];
    const type = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
    const status = ['scheduled', 'in_progress', 'completed', 'cancelled'][Math.floor(Math.random() * 4)];
    
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 180));
    
    let completionDate = null;
    let startDate = null;
    
    if (status === 'completed') {
      completionDate = new Date(scheduledDate);
      completionDate.setDate(completionDate.getDate() + Math.floor(Math.random() * 5));
      startDate = new Date(scheduledDate);
    } else if (status === 'in_progress') {
      startDate = new Date(scheduledDate);
    }
    
    const laborHours = Math.floor(1 + Math.random() * 8);
    const laborRate = 50 + Math.floor(Math.random() * 50);
    
    const partsCount = Math.floor(Math.random() * 4);
    const partsUsed = [];
    const partNames = ['Oil Filter', 'Air Filter', 'Brake Pads', 'Spark Plugs', 'Battery', 'Tires', 'Oil', 'Coolant'];
    
    for (let j = 0; j < partsCount; j++) {
      const quantity = Math.floor(1 + Math.random() * 4);
      const unitPrice = 10 + Math.floor(Math.random() * 200);
      partsUsed.push({
        name: partNames[Math.floor(Math.random() * partNames.length)],
        partNumber: `PART-${Math.floor(1000 + Math.random() * 9000)}`,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });
    }
    
    const partsCost = partsUsed.reduce((sum, p) => sum + p.totalPrice, 0);
    const laborCost = laborHours * laborRate;
    
    records.push({
      vehicle: vehicleId,
      type,
      status,
      scheduledDate,
      startDate,
      completionDate,
      mileageAtService: Math.floor(10000 + Math.random() * 150000),
      description: `${type.replace(/_/g, ' ')} service for vehicle`,
      workPerformed: status === 'completed' ? `Completed ${type.replace(/_/g, ' ')} service` : null,
      partsUsed,
      laborHours,
      laborRate,
      laborCost,
      partsCost,
      totalCost: laborCost + partsCost,
      serviceProvider: {
        name: ['AutoCare Center', 'Quick Service', 'Premium Motors', 'Fleet Services'][Math.floor(Math.random() * 4)],
        phone: `+1 555-${Math.floor(1000 + Math.random() * 9000)}`,
        address: `${Math.floor(100 + Math.random() * 900)} Main St, City`
      },
      technician: userIds[Math.floor(Math.random() * userIds.length)],
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      notes: 'Sample maintenance record',
      createdBy: userIds[Math.floor(Math.random() * userIds.length)]
    });
  }
  
  return records;
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleet_management';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Maintenance.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    const userIds = createdUsers.map(u => u._id);
    
    // Create vehicles
    console.log('🚗 Creating vehicles...');
    const vehicles = generateVehicles(30, userIds);
    const createdVehicles = await Vehicle.create(vehicles);
    console.log(`✅ Created ${createdVehicles.length} vehicles`);
    
    const vehicleIds = createdVehicles.map(v => v._id);
    
    // Create maintenance records
    console.log('🔧 Creating maintenance records...');
    const maintenanceRecords = generateMaintenanceRecords(100, vehicleIds, userIds);
    const createdMaintenance = await Maintenance.create(maintenanceRecords);
    console.log(`✅ Created ${createdMaintenance.length} maintenance records`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin: admin@fleet.com / admin123');
    console.log('  User: john.smith@fleet.com / user123');
    console.log('  Technician: mike.tech@fleet.com / tech123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
