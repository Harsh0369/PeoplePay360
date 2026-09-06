import { htmlReport } from './vendor/k6-reporter.js';
import { textSummary } from './vendor/k6-summary.js';

// Produces three artefacts from one run:
//   - reports/summary.html : rich, shareable HTML report (checks, thresholds,
//                            per-group + per-endpoint latency, error rates)
//   - reports/summary.json : the full machine-readable metrics dump
//   - stdout               : the familiar k6 end-of-test text summary
export function handleSummary(data) {
  return {
    'reports/summary.html': htmlReport(data, { title: 'PeoplePay360 — API Load Test' }),
    'reports/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
