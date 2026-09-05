import mongoose from 'mongoose';
import { RULE_CATEGORIES, COMPUTE_TYPES, PERCENT_BASES } from './constants.js';

const salaryRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. Basic Salary, HRA
    code: { type: String, required: true, uppercase: true, trim: true }, // e.g. BASIC, HRA
    category: { type: String, enum: RULE_CATEGORIES, required: true },
    sequence: { type: Number, default: 100 }, // lower runs first

    computeType: { type: String, enum: COMPUTE_TYPES, default: 'fixed' },

    // computeType === 'fixed'
    amountFixed: { type: Number, default: 0 },

    // computeType === 'percentage'
    percentage: { type: Number, default: 0 }, // e.g. 40 => 40%
    percentBase: { type: String, enum: PERCENT_BASES, default: 'basic' },

    // computeType === 'code'
    // A safe JS expression evaluated with a payroll context (wage, basic, gross,
    // workedDays, totalDays, leaveDays, unpaidLeaveDays, overtimeHours, rules{}...).
    // e.g. "(unpaidLeaveDays / totalDays) * basic"  -> unpaid-leave deduction
    formula: { type: String, default: '' },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('SalaryRule', salaryRuleSchema);
