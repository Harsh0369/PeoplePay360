import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. Regular Salary
    code: { type: String, required: true, uppercase: true, trim: true },
    // Ordered container of rules. Computation sorts by each rule's sequence.
    rules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SalaryRule' }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

salaryStructureSchema.virtual('ruleCount').get(function () {
  return (this.rules || []).length;
});

export default mongoose.model('SalaryStructure', salaryStructureSchema);
