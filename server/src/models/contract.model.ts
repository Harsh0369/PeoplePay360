import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const contractSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    jobPositionId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosition",
      required: true,
    },
    wage: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null, // Null means ongoing
    },
    workingScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "WorkingSchedule",
      required: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Running", "Expired", "Cancelled"],
      default: "Draft",
    }
  },
  {
    timestamps: true,
  }
);

// Compound index for finding active contracts in a period
contractSchema.index({ employeeId: 1, status: 1, startDate: 1, endDate: 1 });

export type ContractModel = InferSchemaType<typeof contractSchema>;
export type ContractDocument = HydratedDocument<ContractModel>;

export const Contract = mongoose.model<ContractDocument>("Contract", contractSchema);
