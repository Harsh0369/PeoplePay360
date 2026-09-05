// Frontend copy of the payroll engine — lets the mock adapter (and demos)
// compute real payslips. Mirrors server/src/services/payrollEngine.js so the
// numbers match what the backend will produce.

const ALLOWED_MATH = new Set(['min', 'max', 'round', 'abs', 'floor', 'ceil', 'pow']);
const SAFE_CHARS = /^[A-Za-z0-9_.$\s+\-*/%()<>=!?:,]+$/;
const IDENTIFIER = /[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)?/g;

export function validateFormula(expr, scopeKeys = []) {
  if (typeof expr !== 'string' || !expr.trim()) return { ok: false, error: 'Formula is empty' };
  if (!SAFE_CHARS.test(expr)) return { ok: false, error: 'Disallowed characters' };
  if (/\b(constructor|prototype|__proto__|import|require|process|global|window|eval|function)\b/i.test(expr))
    return { ok: false, error: 'Forbidden keyword' };
  const allowed = new Set([...scopeKeys, 'true', 'false', 'null']);
  for (const tok of expr.match(IDENTIFIER) || []) {
    if (/^\d/.test(tok)) continue;
    if (tok.startsWith('Math.')) {
      if (!ALLOWED_MATH.has(tok.slice(5))) return { ok: false, error: `Math.${tok.slice(5)} not allowed` };
      continue;
    }
    const root = tok.split('.')[0];
    if (!allowed.has(root)) return { ok: false, error: `Unknown reference: ${tok}` };
  }
  return { ok: true };
}

export function evalFormula(expr, scope = {}) {
  const keys = Object.keys(scope);
  const check = validateFormula(expr, keys);
  if (!check.ok) throw new Error(`Invalid formula "${expr}": ${check.error}`);
  // eslint-disable-next-line no-new-func
  const fn = new Function(...keys, 'Math', `"use strict"; return (${expr});`);
  const n = Number(fn(...keys.map((k) => scope[k]), Math));
  return Number.isFinite(n) ? n : 0;
}

export function computePayslip({ wage = 0, rules = [], inputs = {} }) {
  const { workedDays = 0, totalDays = 0, leaveDays = 0, unpaidLeaveDays = 0, overtimeHours = 0 } = inputs;
  const ordered = [...rules].sort((a, b) => (a.sequence ?? 100) - (b.sequence ?? 100));
  const catTotals = { basic: 0, allowance: 0, deduction: 0 };
  const rulesMap = {};
  const lines = [];
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const presentRatio = totalDays > 0 ? workedDays / totalDays : 1;

  for (const rule of ordered) {
    const gross = catTotals.basic + catTotals.allowance;
    const net = gross - catTotals.deduction;
    const scope = {
      wage, workedDays, totalDays, leaveDays, unpaidLeaveDays, overtimeHours, presentRatio,
      basic: catTotals.basic, allowances: catTotals.allowance, deductions: catTotals.deduction,
      gross, net, rules: rulesMap,
    };
    let raw = 0;
    if (rule.computeType === 'fixed') raw = rule.amountFixed || 0;
    else if (rule.computeType === 'percentage') raw = ((rule.percentage || 0) / 100) * resolveBase(rule.percentBase, scope);
    else if (rule.computeType === 'code') raw = evalFormula(rule.formula || '0', scope);

    let amount;
    if (rule.category === 'deduction') { amount = -Math.abs(round2(raw)); catTotals.deduction += Math.abs(round2(raw)); }
    else if (rule.category === 'basic') { amount = round2(raw); catTotals.basic += amount; }
    else if (rule.category === 'allowance') { amount = round2(raw); catTotals.allowance += amount; }
    else amount = round2(raw);

    rulesMap[rule.code] = amount;
    lines.push({ ruleCode: rule.code, ruleName: rule.name, category: rule.category, sequence: rule.sequence ?? 100, amount });
  }

  const basic = round2(catTotals.basic);
  const allowancesTotal = round2(catTotals.allowance);
  const gross = round2(basic + allowancesTotal);
  const deductionsTotal = round2(catTotals.deduction);
  const net = round2(gross - deductionsTotal);
  return { lines, basic, allowancesTotal, gross, deductionsTotal, net };
}

function resolveBase(base, scope) {
  return { wage: scope.wage, basic: scope.basic, gross: scope.gross, net: scope.net }[base] ?? scope.basic;
}
