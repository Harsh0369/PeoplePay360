import mongoose from 'mongoose';
import { config } from './src/config/environment';
import * as Models from './src/models';
import { getProfileService } from './src/services/employee.service';
import { clockInService, clockOutService } from './src/services/attendance.service';

const testHR = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log("Connected to DB");

    // Clear db for clean test
    await Models.Employee.deleteMany({});
    await Models.Attendance.deleteMany({});
    console.log("Cleared Employees and Attendance");

    // Find or create role
    let role = await Models.Role.findOne({ name: "Admin" });
    if (!role) {
      role = await Models.Role.create({ name: "Admin", permissions: {}, dataScope: "all", isAdmin: true });
    }

    // Find or create user
    let adminUser = await Models.User.findOne();
    if (!adminUser) {
      adminUser = await Models.User.create({
        email: "admin@peoplepay360.com",
        password: "hashedpassword123",
        name: "Test Admin",
        roleId: role._id
      });
      console.log("Created mock admin user for test");
    }

    // Create Employee
    console.log("\n--- Creating Employee ---");
    const employee = await Models.Employee.create({
      userId: adminUser._id,
      name: adminUser.name,
      workEmail: adminUser.email,
      joinDate: new Date(),
    });
    console.log("Created Employee:", employee.name, employee._id);

    // Update User
    adminUser.employeeId = employee._id;
    await adminUser.save();
    console.log("Linked User to Employee");

    // Test getProfileService
    console.log("\n--- Testing Get Profile ---");
    const profile = await getProfileService(adminUser._id.toString());
    console.log("Profile retrieved:", profile.employee.name);

    // Test Clock In
    console.log("\n--- Testing Clock In ---");
    const clockIn = await clockInService(employee._id.toString(), 28.7041, 77.1025, "New Delhi");
    console.log("Clocked In at:", clockIn.checkIn?.time);

    // Try clocking in again (should fail)
    try {
      await clockInService(employee._id.toString());
      console.log("FAIL: Second clock-in succeeded incorrectly");
    } catch (e: any) {
      console.log("SUCCESS: Second clock-in prevented. Error:", e.message);
    }

    // Fake time travel to 2 hours later
    const attendanceRecord = await Models.Attendance.findById(clockIn._id);
    if (attendanceRecord && attendanceRecord.checkIn) {
      attendanceRecord.checkIn.time = new Date(Date.now() - (2 * 60 * 60 * 1000));
      await attendanceRecord.save();
      console.log("Fake time-traveled checkIn to 2 hours ago");
    }

    // Test Clock Out
    console.log("\n--- Testing Clock Out ---");
    const clockOut = await clockOutService(employee._id.toString(), 28.7041, 77.1025, "New Delhi");
    console.log("Clocked Out at:", clockOut.checkOut?.time);
    console.log("Total Worked Hours calculated:", clockOut.workedHours);

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from DB");
  }
};

testHR();
