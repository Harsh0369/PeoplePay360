import { Parser } from 'expr-eval';
import { SalaryRule } from "../../models";
import { ValidationError } from "../../errors";

export interface CreateSalaryRuleDto {
  name: string;
  code: string;
  category: "EARNING" | "DEDUCTION" | "GROSS" | "NET";
  sequence: number;
  amountType: "FIXED" | "FORMULA";
  fixedAmount?: number;
  formula?: string;
}

export const validateFormula = (formula: string) => {
  try {
    const parser = new Parser();
    parser.parse(formula);
  } catch (error: any) {
    throw new ValidationError(`Invalid formula syntax: ${error.message}`);
  }
};

export const createSalaryRuleService = async (data: CreateSalaryRuleDto) => {
  if (data.amountType === "FORMULA" && !data.formula) {
    throw new ValidationError("Formula is required when amountType is FORMULA");
  }

  if (data.amountType === "FORMULA" && data.formula) {
    validateFormula(data.formula);
  }

  const existing = await SalaryRule.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw new ValidationError(`Salary Rule with code ${data.code} already exists`);
  }

  const rule = await SalaryRule.create(data);
  return rule;
};
