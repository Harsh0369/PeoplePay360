import { SalaryStructure } from "../../models";

export const getSalaryStructuresService = async () => {
  return SalaryStructure.find().populate("ruleIds");
};
