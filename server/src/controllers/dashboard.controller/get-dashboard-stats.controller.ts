import { Request, Response } from "express";
import { Employee, Payslip, Department, Attendance, TimeOffRequest } from "../../models";
import { startOfMonth, endOfMonth } from "date-fns";

export const getDashboardStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // 1. Total Headcount
    const headcount = await Employee.countDocuments({ status: "Active" });

    // 2. Department Breakdown
    const departmentBreakdown = await Employee.aggregate([
      { $match: { status: "Active" } },
      {
        $group: {
          _id: "$departmentId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          departmentName: { $ifNull: ["$department.name", "Unassigned"] },
          count: 1,
        },
      },
      { $sort: { count: -1 } }
    ]);

    // 3. Salary & Payslip Stats for current month
    const payslipStats = await Payslip.aggregate([
      {
        $match: {
          periodStart: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: {
              $cond: [{ $eq: ["$status", "Paid"] }, "$netSalary", 0],
            },
          },
          totalPayslips: { $sum: 1 },
        },
      },
    ]);

    const salaryStats = payslipStats[0] || { totalPaid: 0, totalPayslips: 0 };

    // 4. Time Off Requests (Pending)
    const pendingTimeOffs = await TimeOffRequest.countDocuments({
      status: "Pending",
    });

    // 5. Today's Attendance Stats
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const todaysAttendance = await Attendance.countDocuments({
      clockInTime: { $gte: startOfToday, $lte: endOfToday },
    });

    res.status(200).json({
      success: true,
      data: {
        headcount,
        departmentBreakdown,
        salaryPaidThisMonth: salaryStats.totalPaid,
        payslipsThisMonth: salaryStats.totalPayslips,
        pendingTimeOffs,
        todaysAttendance,
      },
    });
  } catch (error: any) {
    console.error("Error in getDashboardStatsController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};
