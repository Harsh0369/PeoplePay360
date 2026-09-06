import * as dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Role } from "../models/role.model";
import { Employee } from "../models/employee.model";

async function addSuperAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  await mongoose.connect(uri);

  let superAdminRole = await Role.findOne({ name: "Super Admin" });
  if (!superAdminRole) {
    superAdminRole = await Role.create({
      name: "Super Admin",
      permissions: {},
      dataScope: "all",
      isAdmin: true,
      isSystem: true,
    });
  }

  const existingUser = await User.findOne({ email: "superadmin@peoplepay.com" });
  if (existingUser) {
    console.log("Super admin already exists!");
    process.exit(0);
  }

  const superAdminUser = await User.create({
    email: "superadmin@peoplepay.com",
    password: "Super@1234",
    name: "Super Admin",
    roleId: superAdminRole._id,
    isSuperAdmin: true,
    active: true,
  });

  const emp = await Employee.create({
    userId: superAdminUser._id,
    name: "Super Admin",
    workEmail: "superadmin@peoplepay.com",
    workPhone: "+910000000000",
    joinDate: new Date("2026-01-01"),
    status: "Active",
  });

  await User.findByIdAndUpdate(superAdminUser._id, { employeeId: emp._id });

  console.log("Super Admin seeded successfully.");
  process.exit(0);
}

addSuperAdmin().catch(console.error);
