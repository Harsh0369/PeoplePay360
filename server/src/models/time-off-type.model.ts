import mongoose, { Document, Schema } from "mongoose";

export interface ITimeOffType extends Document {
  name: string;
  description?: string;
  requiresAllocation: boolean;
  isPaid: boolean;
  isActive: boolean;
}

const timeOffTypeSchema = new Schema<ITimeOffType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    requiresAllocation: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const TimeOffType = mongoose.model<ITimeOffType>("TimeOffType", timeOffTypeSchema);
