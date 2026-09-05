import { SalaryRule } from "../../models";
import { ValidationError, NotFoundError } from "../../errors";
import { validateFormula, CreateSalaryRuleDto } from "./create-salary-rule.service";

export const updateSalaryRuleService = async (id: string, data: Partial<CreateSalaryRuleDto>) => {
  if (data.amountType === "FORMULA" && !data.formula) {
    throw new ValidationError("Formula is required when amountType is FORMULA");
  }

  if (data.formula) {
    validateFormula(data.formula);
  }

  if (data.code) {
    const existing = await SalaryRule.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
    if (existing) {
      throw new ValidationError(`Salary Rule with code ${data.code} already exists`);
    }
  }

  const rule = await SalaryRule.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!rule) {
    throw new NotFoundError("Salary Rule not found");
  }

  return rule;
};
