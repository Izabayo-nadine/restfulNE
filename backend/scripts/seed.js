import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUSES,
} from "../shared/src/config/appConfig.js";

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const extinguisherSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, unique: true },
    location: String,
    type: String,
    size: String,
    installationDate: Date,
    expiryDate: Date,
    status: String,
    registeredBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
const FireExtinguisher = mongoose.model("FireExtinguisher", extinguisherSchema);

function seedAccount(envPrefix, defaults) {
  return {
    email: process.env[`SEED_${envPrefix}_EMAIL`] || defaults.email,
    password: process.env[`SEED_${envPrefix}_PASSWORD`] || defaults.password,
    firstName:
      process.env[`SEED_${envPrefix}_FIRST_NAME`] || defaults.firstName,
    lastName: process.env[`SEED_${envPrefix}_LAST_NAME`] || defaults.lastName,
    role: defaults.role,
  };
}

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fems";
  await mongoose.connect(uri);
  await User.deleteMany({});
  await FireExtinguisher.deleteMany({});

  const hash = async (pw) => bcrypt.hash(pw, 12);

  const adminSeed = seedAccount("ADMIN", {
    email: "admin@tzw-ltd.com",
    password: "Admin@12345",
    firstName: "System",
    lastName: "Admin",
    role: "admin",
  });
  const inspectorSeed = seedAccount("INSPECTOR", {
    email: "inspector@tzw-ltd.com",
    password: "Inspector@123",
    firstName: "Jane",
    lastName: "Inspector",
    role: "inspector",
  });
  const userSeed = seedAccount("USER", {
    email: "user@tzw-ltd.com",
    password: "User@12345",
    firstName: "John",
    lastName: "User",
    role: "user",
  });

  const admin = await User.create({
    ...adminSeed,
    password: await hash(adminSeed.password),
  });
  const inspector = await User.create({
    ...inspectorSeed,
    password: await hash(inspectorSeed.password),
  });
  const facilityUser = await User.create({
    ...userSeed,
    password: await hash(userSeed.password),
  });

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const defaultType = EXTINGUISHER_TYPES[1] || EXTINGUISHER_TYPES[0];
  const defaultSize = EXTINGUISHER_SIZES[1] || EXTINGUISHER_SIZES[0];
  const altType = EXTINGUISHER_TYPES[3] || EXTINGUISHER_TYPES[0];
  const altSize = EXTINGUISHER_SIZES[2] || EXTINGUISHER_SIZES[0];
  const activeStatus = EXTINGUISHER_STATUSES.includes("active")
    ? "active"
    : EXTINGUISHER_STATUSES[0];

  const samples = [
    {
      serialNumber: process.env.SEED_EXTINGUISHER_1_SERIAL || "FE-001-A",
      location:
        process.env.SEED_EXTINGUISHER_1_LOCATION ||
        "Building A - Floor 1 Lobby",
      type: process.env.SEED_EXTINGUISHER_1_TYPE || defaultType,
      size: process.env.SEED_EXTINGUISHER_1_SIZE || defaultSize,
      installationDate: now,
      expiryDate: nextYear,
      status: activeStatus,
      registeredBy: admin._id,
      assignedTo: facilityUser._id,
      companySnapshot: {
        firstName: facilityUser.firstName,
        lastName: facilityUser.lastName,
        email: facilityUser.email,
      },
    },
    {
      serialNumber: process.env.SEED_EXTINGUISHER_2_SERIAL || "FE-002-B",
      location:
        process.env.SEED_EXTINGUISHER_2_LOCATION || "Building B - Warehouse",
      type: process.env.SEED_EXTINGUISHER_2_TYPE || altType,
      size: process.env.SEED_EXTINGUISHER_2_SIZE || altSize,
      installationDate: now,
      expiryDate: nextYear,
      status: activeStatus,
      registeredBy: inspector._id,
      assignedTo: facilityUser._id,
      companySnapshot: {
        firstName: facilityUser.firstName,
        lastName: facilityUser.lastName,
        email: facilityUser.email,
      },
    },
  ];

  await FireExtinguisher.create(samples);

  console.log("Seed complete (microservices shared DB).");
  console.log(
    `  ${adminSeed.email} / (password from SEED_ADMIN_PASSWORD or default)`,
  );
  console.log(
    `  ${inspectorSeed.email} / (password from SEED_INSPECTOR_PASSWORD or default)`,
  );
  console.log(
    `  ${userSeed.email} / (password from SEED_USER_PASSWORD or default)`,
  );
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
