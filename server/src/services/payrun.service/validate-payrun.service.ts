import { Payrun } from "../../models/payrun.model";
import { Payslip } from "../../models/payslip.model";
import { Attendance } from "../../models";
import { ValidationError, NotFoundError } from "../../errors";
import { Types } from "mongoose";

interface PayrunWarning {
  employeeId: Types.ObjectId;
  type: string;
  message: string;
}

/**
 * Validation step for a computed payrun.
 * Checks for business-level issues that should be surfaced before marking paid.
 */
export const validatePayrunService = async (payrunId: string) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  if (payrun.status !== "Computed") {
    throw new ValidationError(
      `Payrun must be in Computed status to validate. Current status: ${payrun.status}`
    );
  }

  const payslips = await Payslip.find({ payrunId: payrun._id }).populate(
    "employeeId",
    "name"
  );

  // Start with existing warnings from compute step
  const warnings: PayrunWarning[] = [...(payrun.warnings as any[])];

  for (const payslip of payslips) {
    const emp = payslip.employeeId as any;
    const empId = payslip.employeeId as Types.ObjectId;
    const empName = emp?.name || "Unknown";

    // 1. Check for duplicate payslips (same employee already paid in an overlapping period from another payrun)
    const existingPaidPayslip = await Payslip.findOne({
      employeeId: empId,
      status: "Paid",
      payrunId: { $ne: payrun._id },
      $or: [
        {
          periodStart: { $lte: payslip.periodEnd },
          periodEnd: { $gte: payslip.periodStart },
        },
      ],
    });

    if (existingPaidPayslip) {
      warnings.push({
        employeeId: empId,
        type: "DUPLICATE_PAYSLIP",
        message: `${empName}: Already has a paid payslip for an overlapping period in another payrun`,
      });
    }

    // 2. Check for open attendance sessions (missing checkout) during the payrun period
    const openSessions = await Attendance.countDocuments({
      employeeId: empId,
      sessionState: "OPEN",
      date: { $gte: payslip.periodStart, $lte: payslip.periodEnd },
    });

    if (openSessions > 0) {
      warnings.push({
        employeeId: empId,
        type: "MISSING_CHECKOUT",
        message: `${empName}: Has ${openSessions} open attendance session(s) during this period`,
      });
    }

    // 3. Check for zero or negative net salary
    if (payslip.netSalary <= 0) {
      warnings.push({
        employeeId: empId,
        type: "ZERO_NET_SALARY",
        message: `${empName}: Net salary is ${payslip.netSalary} — please verify salary rules`,
      });
    }
  }

  // Update payrun with validation results
  payrun.warnings = warnings as any;
  payrun.status = "Validated";
  await payrun.save();

  return {
    payrun,
    validationSummary: {
      totalPayslips: payslips.length,
      warningCount: warnings.length,
      warnings,
    },
  };
};
