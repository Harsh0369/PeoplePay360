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
    sessionState: {
      type: String,
      enum: ["OPEN", "CLOSED", "AUTO_CLOSED"],
      default: "OPEN",
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
// One OPEN attendance session per employee at a time
attendanceSchema.index(
  { employeeId: 1 }, 
  { unique: true, partialFilterExpression: { sessionState: "OPEN" }, name: "unique_open_session_per_employee" }
);
attendanceSchema.index({ date: 1 });
// Covers the default list sort (date desc, then check-in desc) so large,
// unfiltered attendance pages don't do an in-memory sort of ~32k docs.
attendanceSchema.index({ date: -1, "checkIn.time": -1 });

export type AttendanceModel = InferSchemaType<typeof attendanceSchema>;
export type AttendanceDocument = HydratedDocument<AttendanceModel>;

export const Attendance = mongoose.model<AttendanceDocument>("Attendance", attendanceSchema);
