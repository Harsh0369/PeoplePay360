import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose";

const salaryStructureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    ruleIds: [{
      type: Schema.Types.ObjectId,
      ref: "SalaryRule",
    }],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

export type SalaryStructureModel = InferSchemaType<typeof salaryStructureSchema>;
export type SalaryStructureDocument = HydratedDocument<SalaryStructureModel>;

export const SalaryStructure = mongoose.model<SalaryStructureDocument>("SalaryStructure", salaryStructureSchema);
