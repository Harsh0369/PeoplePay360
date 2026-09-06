import mongoose, { Document, Schema } from "mongoose";

export interface ITimeOffAllocation extends Document {
  employeeId: mongoose.Types.ObjectId;
  timeOffTypeId: mongoose.Types.ObjectId;
  validityYear: number;
  grantedDays: number;
  usedDays: number;
  overrideUsedDays?: number;
}

const timeOffAllocationSchema = new Schema<ITimeOffAllocation>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    timeOffTypeId: {
      type: Schema.Types.ObjectId,
      ref: "TimeOffType",
      required: true,
    },
    validityYear: {
      type: Number,
      required: true,
    },
    grantedDays: {
      type: Number,
      required: true,
      default: 0,
    },
    usedDays: {
      type: Number,
      required: true,
      default: 0,
    },
    overrideUsedDays: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// An employee can only have one allocation per type per year
timeOffAllocationSchema.index({ employeeId: 1, timeOffTypeId: 1, validityYear: 1 }, { unique: true });
// Allocation list sorts by validityYear desc (unfiltered).
timeOffAllocationSchema.index({ validityYear: -1 });

export const TimeOffAllocation = mongoose.model<ITimeOffAllocation>("TimeOffAllocation", timeOffAllocationSchema);
