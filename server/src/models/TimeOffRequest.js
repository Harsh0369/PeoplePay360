import mongoose from 'mongoose';
import { REQUEST_STATES } from './constants.js';

const timeOffRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    timeOffType: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeOffType', required: true },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
    duration: { type: Number, default: 0 }, // computed in the type's unit
    reason: { type: String, trim: true },
    state: { type: String, enum: REQUEST_STATES, default: 'draft' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Inclusive whole-day duration (leave granularity is per-day for this platform).
timeOffRequestSchema.methods.computeDuration = function () {
  const ms = new Date(this.dateTo) - new Date(this.dateFrom);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  this.duration = Math.max(0, days);
  return this.duration;
};

timeOffRequestSchema.index({ employee: 1, state: 1 });

export default mongoose.model('TimeOffRequest', timeOffRequestSchema);
