import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const employeeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1:1 mapping with User for login
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bankAccount: {
      type: String,
      trim: true,
      default: null,
    },
    workEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    workPhone: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    jobPositionId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosition",
      default: null,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    joinDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Terminated"],
      default: "Active",
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ status: 1 });

export type EmployeeModel = InferSchemaType<typeof employeeSchema>;
export type EmployeeDocument = HydratedDocument<EmployeeModel>;

export const Employee = mongoose.model<EmployeeDocument>("Employee", employeeSchema);
