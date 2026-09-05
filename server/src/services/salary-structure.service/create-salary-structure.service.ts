import { SalaryStructure, SalaryRule } from "../../models";
import { ValidationError } from "../../errors";

export interface CreateSalaryStructureDto {
  name: string;
  ruleIds: string[];
}

export const createSalaryStructureService = async (data: CreateSalaryStructureDto) => {
  // Validate that all rules exist
  const rulesCount = await SalaryRule.countDocuments({ _id: { $in: data.ruleIds } });
  if (rulesCount !== data.ruleIds.length) {
    throw new ValidationError("One or more Salary Rules do not exist");
  }

  const existing = await SalaryStructure.findOne({ name: data.name });
  if (existing) {
    throw new ValidationError(`Salary Structure with name '${data.name}' already exists`);
  }

  const structure = await SalaryStructure.create(data);
  return structure;
};
