import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const jobPositionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    expectedSalary: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export type JobPositionModel = InferSchemaType<typeof jobPositionSchema>;
export type JobPositionDocument = HydratedDocument<JobPositionModel>;

export const JobPosition = mongoose.model<JobPositionDocument>("JobPosition", jobPositionSchema);
