import { SalaryRule } from "../../models";

export const getSalaryRulesService = async () => {
  return SalaryRule.find().sort({ sequence: 1 });
};
