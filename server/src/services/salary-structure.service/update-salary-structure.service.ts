import { SalaryStructure, SalaryRule } from "../../models";
import { ValidationError, NotFoundError } from "../../errors";
import { CreateSalaryStructureDto } from "./create-salary-structure.service";

export const updateSalaryStructureService = async (id: string, data: Partial<CreateSalaryStructureDto>) => {
  if (data.ruleIds) {
    const rulesCount = await SalaryRule.countDocuments({ _id: { $in: data.ruleIds } });
    if (rulesCount !== data.ruleIds.length) {
      throw new ValidationError("One or more Salary Rules do not exist");
    }
  }

  if (data.name) {
    const existing = await SalaryStructure.findOne({ name: data.name, _id: { $ne: id } });
    if (existing) {
      throw new ValidationError(`Salary Structure with name '${data.name}' already exists`);
    }
  }

  const structure = await SalaryStructure.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("ruleIds");
  if (!structure) {
    throw new NotFoundError("Salary Structure not found");
  }

  return structure;
};
