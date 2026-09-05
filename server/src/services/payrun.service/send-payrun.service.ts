import { Payrun } from "../../models/payrun.model";
import { Payslip } from "../../models/payslip.model";
import { NotFoundError, ValidationError } from "../../errors";

export const sendPayrunService = async (payrunId: string) => {
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  if (payrun.status !== "Paid") {
    throw new ValidationError(
      `Payrun must be in Paid status to send payslips. Current status: ${payrun.status}`
    );
  }

  const payslips = await Payslip.find({ payrunId: payrun._id, status: "Paid" });
  
  if (payslips.length === 0) {
    throw new ValidationError("No paid payslips found for this payrun");
  }

  const now = new Date();
  
  let sentCount = 0;
  const failedEmails: string[] = [];

  for (const payslip of payslips) {
    try {
      // Simulate sending email (in a real app, integrate with SendGrid, AWS SES, etc.)
      
      payslip.isSent = true;
      payslip.sentAt = now;
      await payslip.save();
      sentCount++;
    } catch (error: any) {
      failedEmails.push(payslip.employeeId.toString());
    }
  }

  return {
    total: payslips.length,
    sent: sentCount,
    failed: failedEmails.length,
    failedEmployeeIds: failedEmails
  };
};
