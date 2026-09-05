import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const locationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, trim: true }
  },
  { _id: false }
);

const attendanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: {
      type: Date, // Normalized to midnight UTC for the given day
      required: true,
    },
    checkIn: {
      time: { type: Date, required: true },
      location: locationSchema,
    },
    checkOut: {
      time: { type: Date },
      location: locationSchema,
    },
    workedHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Half-Day", "Late"],
      default: "Present",
    },
    isEditedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ employeeId: 1, date: -1 }, { unique: true }); // One attendance record per employee per day
attendanceSchema.index({ date: 1 });

export type AttendanceModel = InferSchemaType<typeof attendanceSchema>;
export type AttendanceDocument = HydratedDocument<AttendanceModel>;

export const Attendance = mongoose.model<AttendanceDocument>("Attendance", attendanceSchema);
