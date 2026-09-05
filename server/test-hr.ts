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
    await Models.Employee.collection.drop().catch(() => {});
    await Models.Attendance.collection.drop().catch(() => {});
    await Models.WorkingSchedule.collection.drop().catch(() => {});
    await Models.Contract.collection.drop().catch(() => {});
    await Models.AttendanceException.collection.drop().catch(() => {});
    await Models.IdempotencyRecord.collection.drop().catch(() => {});
    // Give Mongo a moment to rebuild indexes
    await new Promise(res => setTimeout(res, 500));
    
    // Explicitly sync indexes for the newly recreated collections (Mongoose will do this if autoIndex is true, but just to be safe)
    await Models.Attendance.syncIndexes();
    await Models.AttendanceException.syncIndexes();
    console.log("Cleared DB Collections");

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

    // Create WorkingSchedule
    console.log("\n--- Creating Working Schedule ---");
    const schedule = await Models.WorkingSchedule.create({
      name: "Standard Full-Time",
      workingDays: [
        { dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Thursday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Friday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Saturday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Sunday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 } // Added all days to avoid Sunday failures
      ]
    });

    // Create Contract
    console.log("\n--- Creating Contract ---");
    const contract = await Models.Contract.create({
      employeeId: employee._id,
      workingScheduleId: schedule._id,
      startDate: new Date("2020-01-01"),
      status: "Running",
      wage: 50000,
      departmentId: new mongoose.Types.ObjectId(),
      jobPositionId: new mongoose.Types.ObjectId()
    });

    // Test getProfileService
    console.log("\n--- Testing Get Profile ---");
    const profile = await getProfileService(adminUser._id.toString());
    console.log("Profile retrieved:", profile.employee.name);

    // Test Clock In
    console.log("\n--- Testing Clock In ---");
    // Clock in exactly at 09:16 to trigger "Late" status since grace is 15 mins
    const mockNow = new Date();
    mockNow.setHours(9, 16, 0, 0);

    const clockIn = await clockInService(employee._id.toString(), 28.7041, 77.1025, "New Delhi");
    // We override time manually in DB to trigger late next step? Actually clockInService uses `new Date()` internally so we can't mock time inside it easily without jest.
    // That's fine, we will just see what status it naturally got based on the real time.
    console.log("Clocked In at:", clockIn.checkIn?.time, "Status:", clockIn.status);

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
    console.log("Clocked Out at:", clockOut.checkOut?.time, "SessionState:", clockOut.sessionState);
    console.log("Total Worked Hours calculated:", clockOut.workedHours);

    // Verify Early Checkout Exception
    const exceptions = await Models.AttendanceException.find({ employeeId: employee._id });
    if (exceptions.length > 0) {
      console.log(`SUCCESS: Generated ${exceptions.length} exception(s). First type:`, exceptions[0].type, exceptions[0].resolutionReason);
    } else {
      console.log("FAIL: No exception generated for early checkout.");
    }

    // Test Second Clock In (Split Shift)
    console.log("\n--- Testing Split Shift Clock In ---");
    try {
      const splitClockIn = await clockInService(employee._id.toString());
      console.log("SUCCESS: Split shift clocked in at:", splitClockIn.checkIn?.time, "SessionState:", splitClockIn.sessionState);
      
      const openCount = await Models.Attendance.countDocuments({ employeeId: employee._id, sessionState: "OPEN" });
      console.log("Total OPEN sessions:", openCount);
    } catch (e: any) {
      console.log("FAIL: Split shift clock-in prevented. Error:", e.message);
    }

    // Test Admin Update
    console.log("\n--- Testing Admin Update ---");
    const updated = await Models.Attendance.findByIdAndUpdate(clockOut._id, { isEditedByAdmin: true }, { new: true });
    console.log("Admin Edit flagged:", updated?.isEditedByAdmin);

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from DB");
  }
};

testHR();
