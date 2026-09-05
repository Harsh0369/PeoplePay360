/**
 * Safe arithmetic expression evaluator for salary-rule formulas.
 *
 * Supports: + - * / %, parentheses, comparisons, ternary (a ? b : c),
 * numbers, and a whitelist of identifiers supplied via `scope`, plus a few
 * Math helpers (min, max, round, abs, floor, ceil). Anything else is rejected
 * BEFORE evaluation, so a rule author cannot reach globals, prototypes, or run
 * arbitrary code. This is what lets "Python code / formula" style rules
 * (attendance-based pay, overtime, unpaid-leave deductions) be configured
 * safely instead of hardcoded.
 */

const ALLOWED_MATH = new Set(['min', 'max', 'round', 'abs', 'floor', 'ceil', 'pow']);
// Only these characters may appear (identifiers/numbers/operators/space).
const SAFE_CHARS = /^[A-Za-z0-9_.$\s+\-*/%()<>=!?:,]+$/;
const IDENTIFIER = /[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)?/g;

export function validateFormula(expr, scopeKeys = []) {
  if (typeof expr !== 'string' || !expr.trim()) {
    return { ok: false, error: 'Formula is empty' };
  }
  if (!SAFE_CHARS.test(expr)) {
    return { ok: false, error: 'Formula contains disallowed characters' };
  }
  if (/\b(constructor|prototype|__proto__|import|require|process|global|window|eval|function)\b/i.test(expr)) {
    return { ok: false, error: 'Formula contains a forbidden keyword' };
  }
  const allowed = new Set([...scopeKeys, 'true', 'false', 'null']);
  const tokens = expr.match(IDENTIFIER) || [];
  for (const tok of tokens) {
    if (/^\d/.test(tok)) continue; // number-like
    if (tok.startsWith('Math.')) {
      const fn = tok.slice(5);
      if (!ALLOWED_MATH.has(fn)) return { ok: false, error: `Math.${fn} is not allowed` };
      continue;
    }
    if (tok.includes('.')) {
      // property access on non-Math objects (e.g. rules.BASIC) — allow only known roots
      const root = tok.split('.')[0];
      if (!allowed.has(root)) return { ok: false, error: `Unknown reference: ${tok}` };
      continue;
    }
    if (!allowed.has(tok)) return { ok: false, error: `Unknown reference: ${tok}` };
  }
  return { ok: true };
}

/**
 * Evaluates a validated formula against a scope object.
 * Returns a finite number (0 on non-finite results).
 */
export function evalFormula(expr, scope = {}) {
  const keys = Object.keys(scope);
  const check = validateFormula(expr, keys);
  if (!check.ok) throw new Error(`Invalid formula "${expr}": ${check.error}`);

  // Build a function whose only visible identifiers are the scope keys + Math.
  // eslint-disable-next-line no-new-func
  const fn = new Function(...keys, 'Math', `"use strict"; return (${expr});`);
  const result = fn(...keys.map((k) => scope[k]), Math);
  const num = Number(result);
  return Number.isFinite(num) ? num : 0;
}
