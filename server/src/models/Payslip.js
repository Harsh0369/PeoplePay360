import mongoose from 'mongoose';
import { PAYSLIP_STATES } from './constants.js';

const payslipLineSchema = new mongoose.Schema(
  {
    ruleCode: String,
    ruleName: String,
    category: String,
    sequence: Number,
    amount: Number,
  },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    payrun: { type: mongoose.Schema.Types.ObjectId, ref: 'Payrun', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure' },

    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    // Attendance / leave inputs snapshotted at compute time.
    workedDays: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },

    lines: { type: [payslipLineSchema], default: [] },

    basic: { type: Number, default: 0 },
    allowancesTotal: { type: Number, default: 0 },
    gross: { type: Number, default: 0 },
    deductionsTotal: { type: Number, default: 0 },
    net: { type: Number, default: 0 },

    warnings: { type: [String], default: [] },
    state: { type: String, enum: PAYSLIP_STATES, default: 'draft' },
  },
  { timestamps: true }
);

payslipSchema.index({ payrun: 1, employee: 1 }, { unique: true });

export default mongoose.model('Payslip', payslipSchema);
