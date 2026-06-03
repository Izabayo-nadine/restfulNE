import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const extinguisherSchema = new mongoose.Schema({
  serialNumber: { type: String, unique: true },
  location: String,
  type: String,
  size: String,
  installationDate: Date,
  expiryDate: Date,
  status: String,
  registeredBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const FireExtinguisher = mongoose.model('FireExtinguisher', extinguisherSchema);

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fems';
  await mongoose.connect(uri);
  await User.deleteMany({});
  await FireExtinguisher.deleteMany({});

  const hash = async (pw) => bcrypt.hash(pw, 12);
  const admin = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@tzw-ltd.com',
    password: await hash('Admin@12345'),
    role: 'admin',
  });
  const inspector = await User.create({
    firstName: 'Jane',
    lastName: 'Inspector',
    email: 'inspector@tzw-ltd.com',
    password: await hash('Inspector@123'),
    role: 'inspector',
  });
  await User.create({
    firstName: 'John',
    lastName: 'User',
    email: 'user@tzw-ltd.com',
    password: await hash('User@12345'),
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

  console.log('Seed complete (microservices shared DB).');
  console.log('  admin@tzw-ltd.com / Admin@12345');
  console.log('  inspector@tzw-ltd.com / Inspector@123');
  console.log('  user@tzw-ltd.com / User@12345');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
