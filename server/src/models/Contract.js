import mongoose from 'mongoose';
import { CONTRACT_STATES } from './constants.js';

const contractSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. CO/2026/0042
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date }, // null => open-ended

    wage: { type: Number, required: true }, // monthly gross wage basis
    department: { type: String, trim: true },
    jobPosition: { type: String, trim: true },

    workingSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkingSchedule' },
    salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure' },

    state: { type: String, enum: CONTRACT_STATES, default: 'draft' },
  },
  { timestamps: true }
);

// True if this contract is valid on the given date.
contractSchema.methods.coversDate = function (date) {
  const d = new Date(date);
  const startsOk = this.startDate <= d;
  const endsOk = !this.endDate || this.endDate >= d;
  return startsOk && endsOk;
};

/**
 * Returns the single contract applicable to a payroll period for an employee.
 * Payroll must never use two overlapping running contracts; we pick the running
 * contract active at the period end, falling back to the latest that overlaps.
 */
contractSchema.statics.findForPeriod = async function (employeeId, periodStart, periodEnd) {
  const overlapping = await this.find({
    employee: employeeId,
    state: 'running',
    startDate: { $lte: new Date(periodEnd) },
    $or: [{ endDate: null }, { endDate: { $gte: new Date(periodStart) } }],
  }).sort({ startDate: -1 });
  return overlapping[0] || null;
};

export default mongoose.model('Contract', contractSchema);
