import { Payrun } from "../../models/payrun.model";
import { Payslip } from "../../models/payslip.model";
import { ValidationError, NotFoundError } from "../../errors";
import { createBusinessLog } from "../business-log.service";

/**
 * Marks a validated payrun as Paid.
 * Transitions all associated payslips to Paid status and records audit trail.
 */
export const markPaidPayrunService = async (
  payrunId: string,
  actorId: string
) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  if (payrun.status !== "Validated") {
    throw new ValidationError(
      `Payrun must be in Validated status to mark as paid. Current status: ${payrun.status}`
    );
  }

  // 1. Bulk update all payslips to Paid
  const result = await Payslip.updateMany(
    { payrunId: payrun._id, status: "Computed" },
    { $set: { status: "Paid" } }
  );

  // 2. Update payrun
  payrun.status = "Paid";
  payrun.paidAt = new Date();
  await payrun.save();

  // 3. Audit log
  createBusinessLog({
    actorId,
    action: "APPROVE",
    entity: "PAYROLL",
    content: `Payrun "${payrun.name}" marked as Paid. ${result.modifiedCount} payslips finalized.`,
    metadata: {
      payrunId: payrun._id,
      periodStart: payrun.periodStart,
      periodEnd: payrun.periodEnd,
      payslipCount: result.modifiedCount,
    },
  });

  return {
    payrun,
    payslipsFinalized: result.modifiedCount,
  };
};
