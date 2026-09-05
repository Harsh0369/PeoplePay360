import { Response } from "express";
import { AuthRequest } from "../../types/auth.type";
import { catchAsync } from "../../utils/catch-async.util";
import { Payslip } from "../../models/payslip.model";
import { NotFoundError } from "../../errors";
import PDFDocument from "pdfkit";

export const getPayslipPdfController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const payslip = await Payslip.findById(id)
    .populate("employeeId", "name workEmail bankAccount")
    .populate("payrunId", "name periodStart periodEnd");

  if (!payslip) {
    throw new NotFoundError("Payslip not found");
  }

  // Create a document
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=payslip_${payslip._id}.pdf`);

  // Pipe the PDF into the response
  doc.pipe(res);

  // Add content
  doc.fontSize(20).text("PAYSLIP", { align: "center" });
  doc.moveDown();

  const employee = payslip.employeeId as any;
  const payrun = payslip.payrunId as any;

  doc.fontSize(12).text(`Employee Name: ${employee.name}`);
  doc.text(`Email: ${employee.workEmail}`);
  doc.text(`Bank Account: ${employee.bankAccount || "N/A"}`);
  doc.moveDown();

  doc.text(`Payrun: ${payrun.name}`);
  doc.text(`Period: ${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}`);
  doc.moveDown();

  // Line items
  doc.fontSize(14).text("Earnings", { underline: true });
  doc.fontSize(12);
  payslip.lineItems
    .filter(item => item.category === "EARNING")
    .forEach(item => {
      doc.text(`${item.ruleName}: $${item.amount.toFixed(2)}`);
    });
  
  doc.moveDown();
  doc.fontSize(14).text("Deductions", { underline: true });
  doc.fontSize(12);
  payslip.lineItems
    .filter(item => item.category === "DEDUCTION")
    .forEach(item => {
      doc.text(`${item.ruleName}: $${item.amount.toFixed(2)}`);
    });

  doc.moveDown();
  doc.fontSize(16).text(`Gross Salary: $${payslip.grossSalary.toFixed(2)}`);
  doc.text(`Total Deductions: $${payslip.totalDeductions.toFixed(2)}`);
  doc.text(`Net Salary: $${payslip.netSalary.toFixed(2)}`, { underline: true });

  // Finalize PDF file
  doc.end();
});
