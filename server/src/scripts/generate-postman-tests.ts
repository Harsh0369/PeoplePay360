import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

const authTests = [
    'pm.test("Status is 200", function () {',
    '    pm.response.to.have.status(200);',
    '});',
    'pm.test("Response time is less than 1000ms", function () {',
    '    pm.expect(pm.response.responseTime).to.be.below(1000);',
    '});',
    'if (pm.response.code === 200) {',
    '    const res = pm.response.json();',
    '    if (res.data && res.data.token) {',
    '        if (pm.info.requestName.includes("Admin Login")) {',
    '            pm.environment.set("admin_token", res.data.token);',
    '        } else if (pm.info.requestName.includes("Employee Login")) {',
    '            pm.environment.set("emp_token", res.data.token);',
    '        }',
    '    }',
    '}'
];

const standardTests = [
    'pm.test("Response time is less than 1000ms", function () {',
    '    pm.expect(pm.response.responseTime).to.be.below(1000);',
    '});',
    'pm.test("Status is 2xx or 400/404 for edge cases", function () {',
    '    pm.expect(pm.response.code).to.be.oneOf([200, 201, 400, 404]);',
    '});'
];

const employeePassTests = [
    'pm.test("Response time is less than 1000ms", function () {',
    '    pm.expect(pm.response.responseTime).to.be.below(1000);',
    '});',
    'pm.test("Status is 200", function () {',
    '    pm.expect(pm.response.code).to.be.oneOf([200]);',
    '});'
];

const rbacTests = [
    'pm.test("Response time is less than 1000ms", function () {',
    '    pm.expect(pm.response.responseTime).to.be.below(1000);',
    '});',
    'pm.test("Status is 403 Forbidden or 401 for unauthorized roles", function () {',
    '    pm.expect(pm.response.code).to.be.oneOf([403, 401]);',
    '});'
];

function createRequest(name: string, method: string, urlPath: string, tokenVar: string, tests: string[], body?: any) {
    const req: any = {
        name,
        request: {
            method,
            header: [
                { key: "Authorization", value: "Bearer {{" + tokenVar + "}}", type: "text" },
                { key: "Content-Type", value: "application/json", type: "text" }
            ],
            url: {
                raw: "{{base_url}}" + urlPath,
                host: ["{{base_url}}"],
                path: urlPath.split('/').filter(Boolean)
            }
        },
        event: [
            {
                listen: "test",
                script: { type: "text/javascript", exec: tests }
            }
        ]
    };
    if (body) {
        req.request.body = { mode: "raw", raw: JSON.stringify(body, null, 2) };
    }
    return req;
}

const collection = {
    info: {
        name: "PeoplePay360 API Comprehensive Test Suite",
        description: "Testing API performance, RBAC, and error handling",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
        { key: "base_url", value: BASE_URL, type: "string" },
        { key: "admin_token", value: "", type: "string" },
        { key: "emp_token", value: "", type: "string" }
    ],
    item: [
        {
            name: "1. Setup & Auth",
            item: [
                {
                    name: "Admin Login",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ email: "admin@peoplepay.com", password: "Test@1234" }) },
                        url: { raw: "{{base_url}}/api/v1/auth/login", host: ["{{base_url}}"], path: ["api", "v1", "auth", "login"] }
                    },
                    event: [{ listen: "test", script: { type: "text/javascript", exec: authTests } }]
                },
                {
                    name: "Employee Login",
                    request: {
                        method: "POST",
                        header: [{ key: "Content-Type", value: "application/json" }],
                        body: { mode: "raw", raw: JSON.stringify({ email: "employee@peoplepay.com", password: "Test@1234" }) },
                        url: { raw: "{{base_url}}/api/v1/auth/login", host: ["{{base_url}}"], path: ["api", "v1", "auth", "login"] }
                    },
                    event: [{ listen: "test", script: { type: "text/javascript", exec: authTests } }]
                }
            ]
        },
        {
            name: "2. RBAC Security Tests",
            item: [
                createRequest("Employee accessing Payruns (Should Fail)", "GET", "/api/v1/payruns", "emp_token", rbacTests),
                createRequest("Employee accessing All Employees (Should Pass)", "GET", "/api/v1/employees", "emp_token", employeePassTests), // employee can read
                createRequest("Employee updating Dept (Should Fail)", "PATCH", "/api/v1/departments/123", "emp_token", rbacTests)
            ]
        },
        {
            name: "3. Feature Tests (Admin)",
            item: [
                createRequest("List Employees", "GET", "/api/v1/employees?limit=5", "admin_token", standardTests),
                createRequest("List Departments", "GET", "/api/v1/departments", "admin_token", standardTests),
                createRequest("List Contracts", "GET", "/api/v1/contracts?limit=5", "admin_token", standardTests),
                createRequest("List Attendance", "GET", "/api/v1/attendance?limit=5", "admin_token", standardTests),
                createRequest("List Time Off", "GET", "/api/v1/time-off/requests?limit=5", "admin_token", standardTests),
                createRequest("List Payruns", "GET", "/api/v1/payruns?limit=5", "admin_token", standardTests),
                createRequest("List Payslips", "GET", "/api/v1/payslips?limit=5", "admin_token", standardTests),
                createRequest("List Business Logs", "GET", "/api/v1/business-logs?limit=5", "admin_token", standardTests),
                createRequest("Dashboard Stats", "GET", "/api/v1/dashboard/stats", "admin_token", standardTests),
            ]
        },
        {
            name: "4. Edge Cases & Error Handling",
            item: [
                createRequest("Create Employee (Missing Data)", "POST", "/api/v1/employees", "admin_token", standardTests, {}),
                createRequest("Get invalid Payrun", "GET", "/api/v1/payruns/invalid-id-here", "admin_token", standardTests),
                createRequest("Invalid Pagination", "GET", "/api/v1/employees?page=abc&limit=-5", "admin_token", standardTests)
            ]
        }
    ]
};

const outPath = path.join(__dirname, '..', '..', 'PeoplePay360.postman_collection.json');
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log('Postman collection generated at:', outPath);
