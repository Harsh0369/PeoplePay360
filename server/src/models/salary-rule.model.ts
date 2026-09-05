import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const salaryRuleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_]+$/, "Code must contain only uppercase letters, numbers, and underscores"],
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
    amountType: {
      type: String,
      enum: ["FIXED", "FORMULA"],
      required: true,
    },
    fixedAmount: {
      type: Number,
      default: 0,
    },
    formula: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
salaryRuleSchema.index({ code: 1 }, { unique: true });
salaryRuleSchema.index({ sequence: 1 });

export type SalaryRuleModel = InferSchemaType<typeof salaryRuleSchema>;
export type SalaryRuleDocument = HydratedDocument<SalaryRuleModel>;

export const SalaryRule = mongoose.model<SalaryRuleDocument>("SalaryRule", salaryRuleSchema);
