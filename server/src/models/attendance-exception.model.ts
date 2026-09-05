import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const attendanceExceptionSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: "Attendance",
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["MISSING_CHECKOUT", "MISSING_CHECKIN", "EARLY_CHECKOUT", "LATE", "UNSCHEDULED", "OVERTIME"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING_REVIEW", "RESOLVED", "REJECTED"],
      default: "PENDING_REVIEW",
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceExceptionSchema.index({ employeeId: 1, status: 1 });

export type AttendanceExceptionModel = InferSchemaType<typeof attendanceExceptionSchema>;
export type AttendanceExceptionDocument = HydratedDocument<AttendanceExceptionModel>;

export const AttendanceException = mongoose.model<AttendanceExceptionDocument>(
  "AttendanceException",
  attendanceExceptionSchema
);
