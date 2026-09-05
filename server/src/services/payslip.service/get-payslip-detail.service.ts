import { Payslip } from "../../models/payslip.model";
import { NotFoundError } from "../../errors";

/**
 * Returns a single payslip with full line item breakdown and populated relations.
 */
export const getPayslipDetailService = async (payslipId: string) => {
  const payslip = await Payslip.findById(payslipId)
    .populate("employeeId", "name workEmail bankAccount")
    .populate("contractId", "wage startDate endDate")
    .populate("payrunId", "name status periodStart periodEnd")
    .populate("salaryStructureId", "name");

  if (!payslip) {
    throw new NotFoundError("Payslip not found");
  }

  return payslip;
};
