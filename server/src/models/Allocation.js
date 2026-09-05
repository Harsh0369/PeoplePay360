import mongoose from 'mongoose';
import { ALLOCATION_STATES } from './constants.js';

const allocationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    timeOffType: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeOffType', required: true },
    allocated: { type: Number, required: true }, // in the type's unit (days/hours)
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    state: { type: String, enum: ALLOCATION_STATES, default: 'draft' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

allocationSchema.index({ employee: 1, timeOffType: 1 });

export default mongoose.model('Allocation', allocationSchema);
