import { Rate, Counter, Trend } from 'k6/metrics';

// Business-level failures (transport OK but the API returned an error shape or a
// non-2xx status). Complements the built-in http_req_failed (transport errors).
export const businessErrors = new Rate('business_errors');

// Total logical API calls issued by the suite.
export const apiCalls = new Counter('api_calls');

// End-to-end latency of a single authenticated API call (mirrors http_req_duration
// but scoped to the calls this suite makes, and always populated even when bodies
// are discarded).
export const apiLatency = new Trend('api_latency', true);
