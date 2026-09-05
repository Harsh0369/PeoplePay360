import mongoose from 'mongoose';
import { TIMEOFF_UNITS } from './constants.js';

const timeOffTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. Paid Time Off
    code: { type: String, required: true, uppercase: true, trim: true }, // e.g. PTO
    unit: { type: String, enum: TIMEOFF_UNITS, default: 'day' },
    requiresAllocation: { type: Boolean, default: true },
    approvalRequired: { type: Boolean, default: true },
    // If true, days off are paid; if false they feed unpaid-leave deductions in payroll.
    paid: { type: Boolean, default: true },
    color: { type: String, default: '#4f46e5' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('TimeOffType', timeOffTypeSchema);
