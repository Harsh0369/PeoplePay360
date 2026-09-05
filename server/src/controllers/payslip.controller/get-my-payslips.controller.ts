import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { ResponseUtil } from "../../utils/response.util";
import { catchAsync } from "../../utils/catch-async.util";
import { Payslip } from "../../models/payslip.model";
import { Employee } from "../../models/employee.model";
import { NotFoundError } from "../../errors";
import { getPaginationParams, buildOffsetPagination } from "../../utils/pagination.util";

export const getMyPayslipsController = catchAsync(async (req: AuthRequest, res: Response) => {
  const employee = await Employee.findOne({ userId: req.userId });
  
  if (!employee) {
    throw new NotFoundError("Employee profile not found for this user");
  }

  const pagination = getPaginationParams(req);
  const { page, limit, skip } = pagination;

  // Only return paid payslips to employees, optionally computed/draft if they have higher roles? 
  // Let's stick to Paid for self-service.
  const query = { 
    employeeId: employee._id,
    status: "Paid" 
  };

  const [data, totalItems] = await Promise.all([
    Payslip.find(query)
      .populate("payrunId", "name periodStart periodEnd")
      .sort({ periodStart: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payslip.countDocuments(query)
  ]);

  const offsetPagination = buildOffsetPagination(totalItems, page, limit);

  return ResponseUtil.paginatedOffset(res, "My payslips fetched successfully", data, offsetPagination);
});
