import { Payrun } from "../../models/payrun.model";
import { Payslip } from "../../models/payslip.model";
import { ValidationError, NotFoundError } from "../../errors";
import { createBusinessLog } from "../business-log.service";

/**
 * Cancel a payrun and all its associated payslips.
 * Cannot cancel if the payrun is already Paid.
 */
export const cancelPayrunService = async (
  payrunId: string,
  actorId: string
) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  if (payrun.status === "Paid") {
    throw new ValidationError(
      "Cannot cancel a payrun that has already been marked as Paid. Paid payruns are immutable."
    );
  }

  if (payrun.status === "Cancelled") {
    throw new ValidationError("Payrun is already cancelled");
  }

  // Cancel all associated payslips
  await Payslip.updateMany(
    { payrunId: payrun._id, status: { $ne: "Paid" } },
    { $set: { status: "Cancelled" } }
  );

  payrun.status = "Cancelled";
  await payrun.save();

  // Audit log
  createBusinessLog({
    actorId,
    action: "DELETE",
    entity: "PAYROLL",
    content: `Payrun "${payrun.name}" cancelled`,
    metadata: { payrunId: payrun._id },
  });

  return payrun;
};
