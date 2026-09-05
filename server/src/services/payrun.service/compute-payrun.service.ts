import { Payrun, PayrunDocument } from "../../models/payrun.model";
import { Payslip } from "../../models/payslip.model";
import { Employee, Contract, SalaryStructure, SalaryRule } from "../../models";
import { ValidationError, NotFoundError } from "../../errors";
import { Types } from "mongoose";
import { Parser } from "expr-eval";

interface PayrunWarning {
  employeeId: Types.ObjectId;
  type: string;
  message: string;
}

/**
 * CORE PAYROLL ENGINE
 * Orchestrates payslip generation for all eligible employees in a payrun.
 * This is the most critical service in the entire payroll system.
 */
export const computePayrunService = async (payrunId: string) => {
  // 1. Load and guard payrun state
  const payrun = await Payrun.findById(payrunId);
  if (!payrun) {
    throw new NotFoundError("Payrun not found");
  }

  if (payrun.status !== "Draft") {
    throw new ValidationError(
      `Payrun must be in Draft status to compute. Current status: ${payrun.status}`
    );
  }

  const warnings: PayrunWarning[] = [];
  const parser = new Parser();

  // 2. Find eligible employees (optionally scoped by department)
  const employeeQuery: any = { status: "Active" };
  if (payrun.departmentId) {
    employeeQuery.departmentId = payrun.departmentId;
  }

  const employees = await Employee.find(employeeQuery);

  if (employees.length === 0) {
    throw new ValidationError(
      "No eligible employees found for this payrun scope"
    );
  }

  let payslipsCreated = 0;

  // 3. Process each employee
  for (const employee of employees) {
    const empId = employee._id as Types.ObjectId;
    const empName = employee.name;

    // 3a. Find the applicable running contract for this period
    let contract;
    try {
      const contracts = await Contract.find({
        employeeId: empId,
        status: "Running",
      });

      // Filter in memory for period overlap (same logic as getApplicableContractService)
      const applicable = contracts.filter((c) => {
        const cStart = c.startDate;
        const cEnd = c.endDate || new Date("9999-12-31");
        return cStart <= payrun.periodEnd && cEnd >= payrun.periodStart;
      });

      if (applicable.length === 0) {
        warnings.push({
          employeeId: empId,
          type: "MISSING_CONTRACT",
          message: `${empName}: No valid running contract found for this period`,
        });
        continue;
      }

      if (applicable.length > 1) {
        warnings.push({
          employeeId: empId,
          type: "MISSING_CONTRACT",
          message: `${empName}: CRITICAL - Multiple overlapping running contracts detected`,
        });
        continue;
      }

      contract = applicable[0];
    } catch {
      warnings.push({
        employeeId: empId,
        type: "MISSING_CONTRACT",
        message: `${empName}: Error resolving contract for this period`,
      });
      continue;
    }

    // 3b. Resolve salary structure
    if (!contract.salaryStructureId) {
      warnings.push({
        employeeId: empId,
        type: "MISSING_SALARY_STRUCTURE",
        message: `${empName}: Contract has no salary structure linked`,
      });
      continue;
    }

    const structure = await SalaryStructure.findById(
      contract.salaryStructureId
    ).populate({
      path: "ruleIds",
      options: { sort: { sequence: 1 } },
    });

    if (!structure || !structure.ruleIds || structure.ruleIds.length === 0) {
      warnings.push({
        employeeId: empId,
        type: "MISSING_SALARY_STRUCTURE",
        message: `${empName}: Salary structure not found or has no rules`,
      });
      continue;
    }

    // 3c. Check for missing bank details (warning only, still generate payslip)
    if (!employee.bankAccount) {
      warnings.push({
        employeeId: empId,
        type: "MISSING_BANK_DETAILS",
        message: `${empName}: No bank account on file — cannot process payment`,
      });
    }

    // 3d. Evaluate salary rules sequentially using expr-eval
    const context: Record<string, number> = {
      wage: contract.wage,
    };

    const lineItems: Array<{
      ruleCode: string;
      ruleName: string;
      category: string;
      sequence: number;
      amount: number;
    }> = [];

    let formulaFailed = false;
    const rules = structure.ruleIds as any[];

    for (const rule of rules) {
      try {
        let amount = 0;

        if (rule.amountType === "FORMULA" && rule.formula) {
          amount = parser.evaluate(rule.formula, context);
        } else if (rule.amountType === "FIXED") {
          amount = rule.fixedAmount || 0;
        }

        // Round to 2 decimal places to avoid floating point drift
        amount = Math.round(amount * 100) / 100;

        context[rule.code] = amount;

        lineItems.push({
          ruleCode: rule.code,
          ruleName: rule.name,
          category: rule.category,
          sequence: rule.sequence,
          amount,
        });
      } catch (err: any) {
        warnings.push({
          employeeId: empId,
          type: "FORMULA_ERROR",
          message: `${empName}: Formula error in rule "${rule.code}": ${err.message}`,
        });
        formulaFailed = true;
        break;
      }
    }

    if (formulaFailed) {
      continue; // Skip this employee entirely if any formula fails
    }

    // 3e. Extract summary amounts from evaluated context
    const grossSalary = context["GROSS"] || 0;
    const netSalary = context["NET"] || 0;

    // Sum all DEDUCTION category line items
    const totalDeductions = lineItems
      .filter((li) => li.category === "DEDUCTION")
      .reduce((sum, li) => sum + li.amount, 0);

    // 3f. Create the Payslip document
    await Payslip.create({
      payrunId: payrun._id,
      employeeId: empId,
      contractId: contract._id,
      salaryStructureId: structure._id,
      wage: contract.wage,
      periodStart: payrun.periodStart,
      periodEnd: payrun.periodEnd,
      lineItems,
      grossSalary: Math.round(grossSalary * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
      status: "Computed",
    });

    payslipsCreated++;
  }

  // 4. Update payrun with computed status and warnings
  payrun.status = "Computed";
  payrun.warnings = warnings as any;
  await payrun.save();

  return {
    payrun,
    summary: {
      totalEmployees: employees.length,
      payslipsGenerated: payslipsCreated,
      employeesSkipped: employees.length - payslipsCreated,
      warningCount: warnings.length,
    },
  };
};
