import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";
import { ValidationError } from "../errors";

const lineItemSchema = new Schema(
  {
    ruleCode: {
      type: String,
      required: true,
    },
    ruleName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["EARNING", "DEDUCTION", "GROSS", "NET"],
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const payslipSchema = new Schema(
  {
    payrunId: {
      type: Schema.Types.ObjectId,
      ref: "Payrun",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    salaryStructureId: {
      type: Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },
    wage: {
      type: Number,
      required: true, // Snapshot of contract wage at computation time
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    lineItems: {
      type: [lineItemSchema],
      default: [],
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Draft", "Computed", "Paid", "Cancelled"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

// One payslip per employee per payrun (prevents duplicates)
payslipSchema.index(
  { payrunId: 1, employeeId: 1 },
  { unique: true, name: "unique_payslip_per_employee_per_payrun" }
);
payslipSchema.index({ periodStart: 1, periodEnd: 1 });

// Immutability guard: Once status is "Paid", block all modifications
payslipSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    // Allow only status changes (e.g., Computed -> Paid transition)
    const modifiedPaths = this.modifiedPaths();
    const allowedModifications = ["status"];

    // If the document was previously Paid, block ALL changes
    // We check the original value before the modification
    if (
      this.isModified("status") &&
      (this as any)._previousStatus === "Paid"
    ) {
      return next(
        new ValidationError("Cannot modify a payslip that has been marked Paid")
      );
    }
  }
  // Track the current status for the immutability check on next save
  (this as any)._previousStatus = this.status;
  next();
});

// Capture original status on init for immutability checks
payslipSchema.post("init", function () {
  (this as any)._previousStatus = this.status;
});

export type PayslipModel = InferSchemaType<typeof payslipSchema>;
export type PayslipDocument = HydratedDocument<PayslipModel>;

export const Payslip = mongoose.model<PayslipDocument>(
  "Payslip",
  payslipSchema
);
