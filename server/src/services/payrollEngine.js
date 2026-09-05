import { evalFormula } from './formula.js';

/**
 * Computes one payslip from a contract wage, an ordered set of salary rules,
 * and attendance/leave inputs for the period.
 *
 * Rules run in ascending `sequence`, so later rules (HRA, Gross, deductions,
 * Net) can build on earlier subtotals — this is why rule ordering matters and
 * is the un-fakeable heart of the platform.
 *
 * @param {Object} args
 * @param {number} args.wage            Contract monthly wage (base for BASIC).
 * @param {Array}  args.rules           Salary rule docs/objects.
 * @param {Object} args.inputs          { workedDays, totalDays, leaveDays,
 *                                        unpaidLeaveDays, overtimeHours }
 * @returns {Object} computed payslip figures + line breakdown.
 */
export function computePayslip({ wage = 0, rules = [], inputs = {} }) {
  const {
    workedDays = 0,
    totalDays = 0,
    leaveDays = 0,
    unpaidLeaveDays = 0,
    overtimeHours = 0,
  } = inputs;

  const ordered = [...rules].sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));

  const catTotals = { basic: 0, allowance: 0, deduction: 0 };
  const rulesMap = {}; // code -> signed line amount, referenceable in formulas
  const lines = [];

  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const presentRatio = totalDays > 0 ? workedDays / totalDays : 1;

  for (const rule of ordered) {
    const gross = catTotals.basic + catTotals.allowance;
    const net = gross - catTotals.deduction;

    const scope = {
      wage,
      workedDays,
      totalDays,
      leaveDays,
      unpaidLeaveDays,
      overtimeHours,
      presentRatio,
      basic: catTotals.basic,
      allowances: catTotals.allowance,
      deductions: catTotals.deduction,
      gross,
      net,
      rules: rulesMap,
    };

    let raw = 0;
    switch (rule.computeType) {
      case 'fixed':
        raw = rule.amountFixed || 0;
        break;
      case 'percentage': {
        const baseVal = resolveBase(rule.percentBase, scope);
        raw = ((rule.percentage || 0) / 100) * baseVal;
        break;
      }
      case 'code':
        raw = evalFormula(rule.formula || '0', scope);
        break;
      default:
        raw = 0;
    }

    // Classify + sign the amount, and accumulate category subtotals.
    let amount;
    if (rule.category === 'deduction') {
      amount = -Math.abs(round2(raw));
      catTotals.deduction += Math.abs(round2(raw));
    } else if (rule.category === 'basic') {
      amount = round2(raw);
      catTotals.basic += amount;
    } else if (rule.category === 'allowance') {
      amount = round2(raw);
      catTotals.allowance += amount;
    } else {
      // 'gross' / 'net' are subtotal/display rules; recorded but not re-accumulated.
      amount = round2(raw);
    }

    rulesMap[rule.code] = amount;
    lines.push({
      ruleCode: rule.code,
      ruleName: rule.name,
      category: rule.category,
      sequence: rule.sequence ?? 100,
      amount,
    });
  }

  const basic = round2(catTotals.basic);
  const allowancesTotal = round2(catTotals.allowance);
  const gross = round2(basic + allowancesTotal);
  const deductionsTotal = round2(catTotals.deduction);
  const net = round2(gross - deductionsTotal);

  return { lines, basic, allowancesTotal, gross, deductionsTotal, net };
}

function resolveBase(base, scope) {
  switch (base) {
    case 'wage':
      return scope.wage;
    case 'basic':
      return scope.basic;
    case 'gross':
      return scope.gross;
    case 'net':
      return scope.net;
    default:
      return scope.basic;
  }
}
