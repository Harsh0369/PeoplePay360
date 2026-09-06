import { Request, Response } from "express";
import { Employee, Payslip, Attendance, TimeOffRequest, Contract } from "../../models";
import { startOfMonth, endOfMonth } from "date-fns";
import { cached } from "../../utils/cache.util";

export const getDashboardStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dashboard aggregates are expensive (several scans/aggregations across the
    // biggest collections) and change slowly, so serve them from a short-lived
    // in-process cache. Within the TTL the whole block is computed once, not once
    // per request — which was a top offender under load.
    const stats = await cached("dashboard:stats", 20_000, async () => {
      const today = new Date();
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      // Run every independent query concurrently — latency becomes the slowest
      // single query instead of the sum of all seven (previously sequential).
      const [
        headcount,
        departmentBreakdown,
        payslipStats,
        pendingTimeOffs,
        todaysAttendance,
        employeeTypeBreakdown,
        contractStatusBreakdown,
      ] = await Promise.all([
        Employee.countDocuments({ status: "Active" }),

        Employee.aggregate([
          { $match: { status: "Active" } },
          { $group: { _id: "$departmentId", count: { $sum: 1 } } },
          { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "department" } },
          { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
          { $project: { departmentName: { $ifNull: ["$department.name", "Unassigned"] }, count: 1 } },
          { $sort: { count: -1 } },
        ]),

        Payslip.aggregate([
          { $match: { periodStart: { $gte: monthStart, $lte: monthEnd } } },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$netSalary", 0] } },
              totalPayslips: { $sum: 1 },
            },
          },
        ]),

        TimeOffRequest.countDocuments({ status: "Pending" }),

        Attendance.countDocuments({ "checkIn.time": { $gte: startOfToday, $lte: endOfToday } }),

        Employee.aggregate([
          { $match: { status: "Active" } },
          { $group: { _id: "$employeeType", count: { $sum: 1 } } },
          { $project: { type: { $ifNull: ["$_id", "FULL_TIME"] }, count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ]),

        Contract.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { status: { $ifNull: ["$_id", "Unknown"] }, count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ]),
      ]);

      const salaryStats = payslipStats[0] || { totalPaid: 0, totalPayslips: 0 };

      return {
        headcount,
        departmentBreakdown,
        salaryPaidThisMonth: salaryStats.totalPaid,
        payslipsThisMonth: salaryStats.totalPayslips,
        pendingTimeOffs,
        todaysAttendance,
        employeeTypeBreakdown,
        contractStatusBreakdown,
      };
    });

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    console.error("Error in getDashboardStatsController:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};
