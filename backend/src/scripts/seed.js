import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import FireExtinguisher from '../models/FireExtinguisher.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fems');
  await User.deleteMany({});
  await FireExtinguisher.deleteMany({});

  const admin = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@tzw-ltd.com',
    password: 'Admin@12345',
    role: 'admin',
  });
  const inspector = await User.create({
    firstName: 'Jane',
    lastName: 'Inspector',
    email: 'inspector@tzw-ltd.com',
    password: 'Inspector@123',
    role: 'inspector',
  });
  await User.create({
    firstName: 'John',
    lastName: 'User',
    email: 'user@tzw-ltd.com',
    password: 'User@12345',
    role: 'user',
  });

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await FireExtinguisher.create([
    {
      serialNumber: 'FE-001-A',
      location: 'Building A - Floor 1 Lobby',
      type: 'CO₂',
      size: '5 lb',
      installationDate: now,
      expiryDate: nextYear,
      status: 'active',
      registeredBy: admin._id,
    },
    {
      serialNumber: 'FE-002-B',
      location: 'Building B - Warehouse',
      type: 'Dry Chemical',
      size: '9 lb',
      installationDate: now,
      expiryDate: nextYear,
      status: 'active',
      registeredBy: inspector._id,
    },
  ]);

  console.log('Seed complete. Demo accounts:');
  console.log('  admin@tzw-ltd.com / Admin@12345');
  console.log('  inspector@tzw-ltd.com / Inspector@123');
  console.log('  user@tzw-ltd.com / User@12345');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
