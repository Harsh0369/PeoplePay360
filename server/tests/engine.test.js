import assert from 'node:assert';
import { computePayslip } from '../src/services/payrollEngine.js';
import { validateFormula } from '../src/services/formula.js';

// A realistic "Regular Salary" structure (INR), authored as rules — not hardcoded.
const rules = [
  { name: 'Basic Salary', code: 'BASIC', category: 'basic', sequence: 10, computeType: 'percentage', percentage: 50, percentBase: 'wage' },
  { name: 'House Rent Allowance', code: 'HRA', category: 'allowance', sequence: 20, computeType: 'percentage', percentage: 40, percentBase: 'basic' },
  { name: 'Conveyance', code: 'CONV', category: 'allowance', sequence: 30, computeType: 'fixed', amountFixed: 2000 },
  // Overtime at 1.5x the hourly rate derived from basic and scheduled hours.
  { name: 'Overtime', code: 'OT', category: 'allowance', sequence: 40, computeType: 'code', formula: 'overtimeHours * (basic / (totalDays * 8)) * 1.5' },
  { name: 'Provident Fund', code: 'PF', category: 'deduction', sequence: 50, computeType: 'percentage', percentage: 12, percentBase: 'basic' },
  // The star: unpaid-leave deduction driven by live attendance/leave data.
  { name: 'Unpaid Leave', code: 'UNPAID', category: 'deduction', sequence: 60, computeType: 'code', formula: '(unpaidLeaveDays / totalDays) * basic' },
  { name: 'Professional Tax', code: 'PT', category: 'deduction', sequence: 70, computeType: 'fixed', amountFixed: 200 },
];

let pass = 0;
const ok = (label) => { console.log('  ✓', label); pass++; };

// --- Scenario A: full attendance, no unpaid leave, no overtime ---
const a = computePayslip({ wage: 50000, rules, inputs: { workedDays: 22, totalDays: 22, unpaidLeaveDays: 0, overtimeHours: 0 } });
assert.strictEqual(a.basic, 25000, 'basic = 50% of 50000');
assert.strictEqual(a.allowancesTotal, 12000, 'HRA 10000 + Conveyance 2000');
assert.strictEqual(a.gross, 37000, 'gross = basic + allowances');
assert.strictEqual(a.deductionsTotal, 3200, 'PF 3000 + PT 200');
assert.strictEqual(a.net, 33800, 'net = gross - deductions');
ok('Scenario A (full month) -> net 33800');

// --- Scenario B: 2 unpaid leave days + 5 overtime hours ---
const b = computePayslip({ wage: 50000, rules, inputs: { workedDays: 20, totalDays: 22, unpaidLeaveDays: 2, overtimeHours: 5 } });
const ot = 5 * (25000 / (22 * 8)) * 1.5;
const unpaid = (2 / 22) * 25000;
assert.ok(Math.abs(b.lines.find((l) => l.ruleCode === 'OT').amount - Math.round(ot * 100) / 100) < 0.01, 'overtime computed from live hours');
assert.ok(Math.abs(b.lines.find((l) => l.ruleCode === 'UNPAID').amount + Math.round(unpaid * 100) / 100) < 0.01, 'unpaid leave deducted from net');
assert.ok(b.net < a.net, 'net drops vs full month due to unpaid leave');
ok(`Scenario B (2 unpaid + 5 OT) -> net ${b.net} (down from ${a.net})`);

// --- Sequencing matters: HRA depends on BASIC computed first ---
assert.strictEqual(b.lines.find((l) => l.ruleCode === 'HRA').amount, 10000, 'HRA = 40% of BASIC (needs BASIC first)');
ok('Rule sequencing respected (HRA builds on BASIC)');

// --- Formula safety: malicious formulas are rejected before eval ---
assert.strictEqual(validateFormula('process.exit(1)', ['basic']).ok, false, 'blocks process access');
assert.strictEqual(validateFormula('constructor.constructor("return 1")()', ['basic']).ok, false, 'blocks constructor escape');
assert.strictEqual(validateFormula('basic * 0.1', ['basic']).ok, true, 'allows legit arithmetic');
ok('Formula sandbox blocks unsafe input, allows arithmetic');

console.log(`\nENGINE TESTS PASSED (${pass}/4)`);
console.log('\nScenario B payslip breakdown:');
for (const l of b.lines) console.log(`  ${l.category.padEnd(10)} ${l.ruleCode.padEnd(8)} ${l.amount}`);
console.log(`  ${''.padEnd(10)} ${'NET'.padEnd(8)} ${b.net}`);
