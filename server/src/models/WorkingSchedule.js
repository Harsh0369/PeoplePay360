import mongoose from 'mongoose';
import { SCHEDULE_TYPES, WEEKDAYS } from './constants.js';

const scheduleLineSchema = new mongoose.Schema(
  {
    day: { type: String, enum: WEEKDAYS, required: true },
    startTime: { type: Number, required: true }, // hour of day, e.g. 9.0
    endTime: { type: Number, required: true },   // e.g. 18.0
    breakHours: { type: Number, default: 0 },
  },
  { _id: false }
);

const workingScheduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    calendarType: { type: String, enum: SCHEDULE_TYPES, default: 'full_time' },
    company: { type: String, default: 'Urban Corp' },
    lines: { type: [scheduleLineSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Weekly hours derived from the schedule lines, never entered manually.
workingScheduleSchema.virtual('hoursPerWeek').get(function () {
  return (this.lines || []).reduce(
    (sum, l) => sum + Math.max(0, l.endTime - l.startTime - (l.breakHours || 0)),
    0
  );
});

workingScheduleSchema.virtual('daysPerWeek').get(function () {
  return new Set((this.lines || []).map((l) => l.day)).size;
});

// Average hours in a standard working day for this schedule (used by payroll/attendance).
workingScheduleSchema.virtual('hoursPerDay').get(function () {
  const days = new Set((this.lines || []).map((l) => l.day)).size;
  if (!days) return 8;
  const total = (this.lines || []).reduce(
    (sum, l) => sum + Math.max(0, l.endTime - l.startTime - (l.breakHours || 0)),
    0
  );
  return total / days;
});

export default mongoose.model('WorkingSchedule', workingScheduleSchema);
