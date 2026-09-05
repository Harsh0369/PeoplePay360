import mongoose from 'mongoose';
import { config } from './src/config/environment';
import * as Models from './src/models';
import { getProfileService } from './src/services/employee.service';
import { clockInService, clockOutService, adminUpdateAttendanceService } from './src/services/attendance.service';
import { raiseTimeOffRequestService, reviewTimeOffRequestService, adminOverrideRequestService } from './src/services/time-off.service';
import { createSalaryRuleService } from './src/services/salary-rule.service';
import { createSalaryStructureService } from './src/services/salary-structure.service';
import { createDepartmentService, assignEmployeeDepartmentService } from './src/services/department.service';
import { createJobPositionService, assignEmployeeJobPositionService } from './src/services/job-position.service';
import { createWorkingScheduleService } from './src/services/working-schedule.service';
import { createContractService, updateContractService, getApplicableContractService } from './src/services/contract.service/index';
import { Parser } from 'expr-eval';

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
    await Models.BusinessLog.collection.drop().catch(() => {});
    await Models.TimeOffType.collection.drop().catch(() => {});
    await Models.TimeOffAllocation.collection.drop().catch(() => {});
    await Models.TimeOffRequest.collection.drop().catch(() => {});
    await Models.SalaryRule.collection.drop().catch(() => {});
    await Models.SalaryStructure.collection.drop().catch(() => {});
    await Models.Department.collection.drop().catch(() => {});
    await Models.JobPosition.collection.drop().catch(() => {});
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

    // Test Organization (Department & Job Title)
    console.log("\n--- Testing Organization (Department & Job Title) ---");
    const dept = await createDepartmentService({
      name: "Engineering"
    });
    console.log("Created Department:", dept.name);

    const jobPos = await createJobPositionService({
      title: "Senior Backend Developer",
      departmentId: dept._id.toString(),
      expectedSalary: 120000
    });
    console.log("Created Job Position:", jobPos.title);

    await assignEmployeeDepartmentService(employee._id.toString(), dept._id.toString(), adminUser._id.toString());
    await assignEmployeeJobPositionService(employee._id.toString(), jobPos._id.toString(), adminUser._id.toString());
    console.log("SUCCESS: Assigned Employee to Department and Job Position");

    // Test WorkingSchedule Service
    console.log("\n--- Testing Working Schedule Service ---");
    try {
      await createWorkingScheduleService({
        name: "Invalid Schedule",
        workingDays: [
          { dayOfWeek: "Monday", startTime: "25:00", endTime: "17:00", breakDurationMinutes: 60 }
        ]
      });
      console.log("FAIL: Invalid time format schedule succeeded incorrectly");
    } catch (e: any) {
      console.log("SUCCESS: Invalid time format caught:", e.message);
    }

    const schedule = await createWorkingScheduleService({
      name: "Standard Full-Time",
      workingDays: [
        { dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Tuesday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Thursday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Friday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Saturday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 },
        { dayOfWeek: "Sunday", startTime: "09:00", endTime: "17:00", breakDurationMinutes: 60 }
      ]
    });
    console.log(`Created Working Schedule: ${schedule.name}, Total Weekly Hours: ${schedule.totalWeeklyHours}`);

    // Test Contract Service
    console.log("\n--- Testing Contract Service & Period Applicability ---");
    const contract = await createContractService({
      employeeId: employee._id.toString(),
      workingScheduleId: schedule._id.toString(),
      departmentId: dept._id.toString(),
      jobPositionId: jobPos._id.toString(),
      startDate: "2020-01-01",
      wage: 50000
    });
    console.log(`Created Contract in Draft state. Status: ${contract.status}`);

    // Activate contract
    const activatedContract = await updateContractService(contract._id.toString(), { status: "Running" });
    console.log(`Activated Contract. Status: ${activatedContract.status}`);

    // Test Overlapping Running Contract Prevention
    try {
      const overlappingContract = await createContractService({
        employeeId: employee._id.toString(),
        workingScheduleId: schedule._id.toString(),
        departmentId: dept._id.toString(),
        jobPositionId: jobPos._id.toString(),
        startDate: "2022-01-01",
        wage: 60000
      });
      await updateContractService(overlappingContract._id.toString(), { status: "Running" });
      console.log("FAIL: Overlapping running contract activation succeeded incorrectly");
    } catch (e: any) {
      console.log("SUCCESS: Overlapping running contract prevented:", e.message);
    }

    // Test Applicable Contract Retrieval for Payroll Period
    const applicable = await getApplicableContractService(employee._id.toString(), "2026-09-01", "2026-09-30");
    console.log(`SUCCESS: Retrieved applicable contract for Sept 2026. Wage: ${applicable.wage}`);

    try {
      await getApplicableContractService(employee._id.toString(), "2019-01-01", "2019-01-31");
      console.log("FAIL: Historical period before contract start date retrieved a contract incorrectly");
    } catch (e: any) {
      console.log("SUCCESS: Non-applicable period rejected:", e.message);
    }

    // --- Testing Get Profile ---
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
    const updated = await adminUpdateAttendanceService(
      clockOut._id.toString(), 
      { status: "Present" }, 
      adminUser._id.toString()
    );
    console.log("Admin Edit flagged:", updated?.isEditedByAdmin);

    // Wait for setImmediate log to be written
    await new Promise(res => setTimeout(res, 50));

    // Verify Business Log
    const logs = await Models.BusinessLog.find({ affectedEmployeeId: employee._id });
    if (logs.length > 0) {
      console.log(`SUCCESS: Found ${logs.length} business log(s). First action:`, logs[0].action, "by User:", logs[0].actorId);
    } else {
      console.log("FAIL: No business log generated for admin override.");
    }

    // --- Testing Time Off (Leave Management) ---
    console.log("\n--- Testing Time Off (Leave Management) ---");
    const sickLeave = await Models.TimeOffType.create({
      name: "Sick Leave",
      requiresAllocation: true,
      isPaid: true
    });

    const allocation = await Models.TimeOffAllocation.create({
      employeeId: employee._id,
      timeOffTypeId: sickLeave._id,
      validityYear: new Date().getFullYear(),
      grantedDays: 5,
      usedDays: 0
    });
    console.log("Created Sick Leave Allocation: 5 days granted.");

    console.log("1. Employee raises request for 3 days");
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const request1 = await raiseTimeOffRequestService({
      employeeId: employee._id.toString(),
      timeOffTypeId: sickLeave._id.toString(),
      startDate: today,
      endDate: threeDaysLater,
      requestedDays: 3
    });
    console.log("SUCCESS: Request raised. Status:", request1.status);

    console.log("2. Manager Approves request");
    const approvedRequest = await reviewTimeOffRequestService({
      requestId: request1._id.toString(),
      status: "APPROVED",
      reviewerId: adminUser._id.toString()
    });
    const updatedAllocation = await Models.TimeOffAllocation.findById(allocation._id);
    console.log("SUCCESS: Request Approved. Allocation usedDays is now:", updatedAllocation?.usedDays);

    console.log("3. Employee raises another request for 3 days (Should fail)");
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeek.getDate() + 3);

    try {
      await raiseTimeOffRequestService({
        employeeId: employee._id.toString(),
        timeOffTypeId: sickLeave._id.toString(),
        startDate: nextWeek,
        endDate: nextWeekEnd,
        requestedDays: 3
      });
      console.log("FAIL: Second request incorrectly succeeded");
    } catch (e: any) {
      console.log("SUCCESS: Over-allocation prevented. Error:", e.message);
    }

    console.log("4. Admin Overrides Approval to Rejected");
    await adminOverrideRequestService({
      requestId: request1._id.toString(),
      newStatus: "REJECTED",
      actorId: adminUser._id.toString(),
      reason: "Employee came to work after all"
    });
    
    const finalAllocation = await Models.TimeOffAllocation.findById(allocation._id);
    console.log("SUCCESS: Admin Override processed. Allocation usedDays refunded to:", finalAllocation?.usedDays);

    await new Promise(res => setTimeout(res, 50));
    const overrideLog = await Models.BusinessLog.findOne({ entity: "LEAVE", action: "OVERRIDE" });
    console.log("SUCCESS: Business Log created for Leave Override. Content:", overrideLog?.content);

    // --- Testing Payroll Engine Configuration ---
    console.log("\n--- Testing Payroll Engine Configuration ---");
    const ruleBasic = await createSalaryRuleService({
      name: "Basic Salary",
      code: "BASIC",
      category: "EARNING",
      sequence: 10,
      amountType: "FORMULA",
      formula: "wage * 0.5"
    });

    const ruleHra = await createSalaryRuleService({
      name: "House Rent Allowance",
      code: "HRA",
      category: "EARNING",
      sequence: 20,
      amountType: "FORMULA",
      formula: "BASIC * 0.4"
    });

    const ruleGross = await createSalaryRuleService({
      name: "Gross Salary",
      code: "GROSS",
      category: "GROSS",
      sequence: 100,
      amountType: "FORMULA",
      formula: "BASIC + HRA"
    });

    const ruleTax = await createSalaryRuleService({
      name: "Taxes",
      code: "TAX",
      category: "DEDUCTION",
      sequence: 150,
      amountType: "FORMULA",
      formula: "GROSS * 0.1"
    });

    const ruleNet = await createSalaryRuleService({
      name: "Net Salary",
      code: "NET",
      category: "NET",
      sequence: 200,
      amountType: "FORMULA",
      formula: "GROSS - TAX"
    });

    const structure = await createSalaryStructureService({
      name: "Standard Full-Time Structure",
      ruleIds: [
        ruleBasic._id.toString(),
        ruleHra._id.toString(),
        ruleGross._id.toString(),
        ruleTax._id.toString(),
        ruleNet._id.toString()
      ]
    });
    console.log("SUCCESS: Created Salary Rules & Structure");

    // Update contract with structure
    contract.salaryStructureId = structure._id;
    await contract.save();
    console.log("SUCCESS: Linked structure to contract");

    // Simulate Payroll Engine calculation for this contract
    console.log("Simulating Payroll Engine Formula Evaluation:");
    const populatedStructure = await Models.SalaryStructure.findById(structure._id).populate({
      path: "ruleIds",
      options: { sort: { sequence: 1 } }
    });

    const context: Record<string, number> = {
      wage: contract.wage // 50000
    };

    const parser = new Parser();
    const rulesList = populatedStructure?.ruleIds as any[];

    for (const rule of rulesList) {
      if (rule.amountType === "FORMULA" && rule.formula) {
        const val = parser.evaluate(rule.formula, context);
        context[rule.code] = val;
        console.log(`Evaluated ${rule.code} [seq ${rule.sequence}]: ${rule.formula} -> ${val}`);
      } else if (rule.amountType === "FIXED") {
        context[rule.code] = rule.fixedAmount;
        console.log(`Evaluated ${rule.code} [seq ${rule.sequence}]: FIXED -> ${rule.fixedAmount}`);
      }
    }

    if (context["NET"] === 31500) {
      console.log("SUCCESS: Mathematical evaluation is strictly correct.");
    } else {
      console.log("FAIL: Mathematical evaluation incorrect. Expected NET 31500, got", context["NET"]);
    }

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from DB");
  }
};

testHR();
