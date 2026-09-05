import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { Payslip } from "../../models/payslip.model";
import { Employee } from "../../models/employee.model";
import { NotFoundError } from "../../errors";

export const getMyPayslipsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await Employee.findOne({ userId: req.userId });
  
  if (!employee) {
    throw new NotFoundError("Employee profile not found for this user");
  }

  // Only return paid payslips to employees, optionally computed/draft if they have higher roles? 
  // Let's stick to Paid for self-service.
  const payslips = await Payslip.find({ 
    employeeId: employee._id,
    status: "Paid" 
  })
  .populate("payrunId", "name periodStart periodEnd")
  .sort({ periodStart: -1 });

  return ResponseUtil.success(res, "My payslips fetched successfully", payslips);
});
