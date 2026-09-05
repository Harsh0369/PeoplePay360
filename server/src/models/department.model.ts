import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    parentDepartmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type DepartmentModel = InferSchemaType<typeof departmentSchema>;
export type DepartmentDocument = HydratedDocument<DepartmentModel>;

export const Department = mongoose.model<DepartmentDocument>("Department", departmentSchema);
