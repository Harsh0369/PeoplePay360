import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const shiftSchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: {
      type: String, // HH:mm format
      required: true,
    },
    endTime: {
      type: String, // HH:mm format
      required: true,
    },
    breakDurationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    }
  },
  { _id: false }
);

const workingScheduleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    workingDays: {
      type: [shiftSchema],
      default: [],
    },
    totalWeeklyHours: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total weekly hours automatically
workingScheduleSchema.pre("save", function (next) {
  let totalMinutes = 0;
  
  if (this.workingDays && this.workingDays.length > 0) {
    for (const shift of this.workingDays) {
      const [startHour, startMin] = shift.startTime.split(":").map(Number);
      const [endHour, endMin] = shift.endTime.split(":").map(Number);
      
      let shiftMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      
      // Handle overnight shifts (if end time is earlier than start time)
      if (shiftMinutes < 0) {
        shiftMinutes += 24 * 60;
      }
      
      shiftMinutes -= shift.breakDurationMinutes || 0;
      
      if (shiftMinutes > 0) {
        totalMinutes += shiftMinutes;
      }
    }
  }
  
  this.totalWeeklyHours = parseFloat((totalMinutes / 60).toFixed(2));
  next();
});

export type WorkingScheduleModel = InferSchemaType<typeof workingScheduleSchema>;
export type WorkingScheduleDocument = HydratedDocument<WorkingScheduleModel>;

export const WorkingSchedule = mongoose.model<WorkingScheduleDocument>("WorkingSchedule", workingScheduleSchema);
