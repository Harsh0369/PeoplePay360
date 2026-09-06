import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { catchAsync } from "../../utils/catch-async.util";
import { TimeOffAllocation } from "../../models";

export const exportTimeOffAllocationsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const query: any = {};
  
  if (req.query.employeeId) query.employeeId = req.query.employeeId;
  if (req.query.timeOffTypeId) query.timeOffTypeId = req.query.timeOffTypeId;
  if (req.query.validityYear) query.validityYear = Number(req.query.validityYear);

  const allocations = await TimeOffAllocation.find(query)
    .populate("employeeId", "name workEmail empCode")
    .populate("timeOffTypeId", "name")
    .sort({ validityYear: -1, "employeeId.name": 1 })
    .lean();

  // Build CSV
  const header = ["Employee Name", "Employee Email", "Leave Type", "Validity Year", "Granted Days", "Used Days", "Remaining Days"];
  const rows = allocations.map((a: any) => {
    const empName = a.employeeId?.name || "Unknown";
    const empEmail = a.employeeId?.workEmail || "";
    const typeName = a.timeOffTypeId?.name || "Unknown";
    const granted = a.grantedDays || 0;
    const used = a.usedDays || 0;
    const remaining = granted - used;

    return [
      `"${empName}"`,
      `"${empEmail}"`,
      `"${typeName}"`,
      a.validityYear,
      granted,
      used,
      remaining
    ].join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=leave_ledger_${new Date().toISOString().split("T")[0]}.csv`);
  res.status(200).send(csv);
});
