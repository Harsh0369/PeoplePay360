import mongoose, { Document, Schema } from "mongoose";

export interface ITimeOffRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  timeOffTypeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  requestedDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerId?: mongoose.Types.ObjectId;
  reviewReason?: string;
  isEditedByAdmin: boolean;
}

const timeOffRequestSchema = new Schema<ITimeOffRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    timeOffTypeId: {
      type: Schema.Types.ObjectId,
      ref: "TimeOffType",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    requestedDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewReason: {
      type: String,
    },
    isEditedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// The requests list sorts by createdAt desc (unfiltered).
timeOffRequestSchema.index({ createdAt: -1 });

export const TimeOffRequest = mongoose.model<ITimeOffRequest>("TimeOffRequest", timeOffRequestSchema);
