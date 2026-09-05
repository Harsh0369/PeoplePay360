import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const payrunWarningSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "MISSING_CONTRACT",
        "MISSING_SALARY_STRUCTURE",
        "MISSING_BANK_DETAILS",
        "FORMULA_ERROR",
        "DUPLICATE_PAYSLIP",
        "MISSING_CHECKOUT",
        "ZERO_NET_SALARY",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const payrunSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Computed", "Validated", "Paid", "Cancelled"],
      default: "Draft",
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null, // null = all departments
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    warnings: {
      type: [payrunWarningSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payruns for the same period and scope
payrunSchema.index(
  { periodStart: 1, periodEnd: 1, departmentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $nin: ["Cancelled"] } },
    name: "unique_active_payrun_per_period_scope",
  }
);
payrunSchema.index({ status: 1 });

export type PayrunModel = InferSchemaType<typeof payrunSchema>;
export type PayrunDocument = HydratedDocument<PayrunModel>;

export const Payrun = mongoose.model<PayrunDocument>("Payrun", payrunSchema);
