import { Payrun } from "../../models/payrun.model";
import { Payslip } from "../../models/payslip.model";
import { NotFoundError } from "../../errors";

/**
 * Returns a single payrun with all its associated payslips.
 */
export const getPayrunDetailService = async (payrunId: string) => {
  const payrun = await Payrun.findById(payrunId)
    .populate("createdBy", "name email")
    .populate("departmentId", "name");

  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  const payslips = await Payslip.find({ payrunId: payrun._id })
    .populate("employeeId", "name workEmail bankAccount")
    .populate("contractId", "wage startDate endDate")
    .sort({ netSalary: -1 }); // Highest paid first

  return {
    payrun,
    payslips,
    totals: {
      totalGross: payslips.reduce((sum, ps) => sum + ps.grossSalary, 0),
      totalDeductions: payslips.reduce((sum, ps) => sum + ps.totalDeductions, 0),
      totalNet: payslips.reduce((sum, ps) => sum + ps.netSalary, 0),
      employeeCount: payslips.length,
    },
  };
};
