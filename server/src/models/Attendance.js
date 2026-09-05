import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from './constants.js';

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    workedHours: { type: Number, default: 0 }, // computed
    status: { type: String, enum: ATTENDANCE_STATUS, default: 'present' },
    manualEdit: { type: Boolean, default: false },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

attendanceSchema.methods.computeWorkedHours = function () {
  if (this.checkIn && this.checkOut) {
    this.workedHours = Math.max(0, (this.checkOut - this.checkIn) / (1000 * 60 * 60));
  } else {
    this.workedHours = 0;
  }
  return this.workedHours;
};

attendanceSchema.index({ employee: 1, checkIn: 1 });

export default mongoose.model('Attendance', attendanceSchema);
