import mongoose from 'mongoose';
import { PAYRUN_STATES, EMPLOYEE_TYPES } from './constants.js';

const payrunSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. February 2026
    salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure', required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    // Scope filter chosen in step 1 of the wizard (optional).
    employeeType: { type: String, enum: [...EMPLOYEE_TYPES, 'all'], default: 'all' },

    // Explicitly selected employees (step 2 of the wizard).
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    payslips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payslip' }],

    state: { type: String, enum: PAYRUN_STATES, default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Payrun', payrunSchema);
