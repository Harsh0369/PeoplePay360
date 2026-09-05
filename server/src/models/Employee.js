import mongoose from 'mongoose';
import { EMPLOYEE_TYPES, EMPLOYEE_STATUS } from './constants.js';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    workEmail: { type: String, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    image: { type: String }, // URL or data URI

    department: { type: String, trim: true },
    jobPosition: { type: String, trim: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    workingSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkingSchedule' },

    employeeType: { type: String, enum: EMPLOYEE_TYPES, default: 'full_time' },
    status: { type: String, enum: EMPLOYEE_STATUS, default: 'active' },

    joinDate: { type: Date, default: Date.now },
    bankAccount: { type: String, trim: true }, // used for payroll warnings when missing
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
