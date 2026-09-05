import { SalaryRule } from "../../models";
import { NotFoundError } from "../../errors";

export const deleteSalaryRuleService = async (id: string) => {
  const rule = await SalaryRule.findByIdAndDelete(id);
  if (!rule) {
    throw new NotFoundError("Salary Rule not found");
  }
  return rule;
};
