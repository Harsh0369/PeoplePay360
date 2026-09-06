#!/usr/bin/env bash
# PeoplePay360 — k6 load-test runner (bash / Git Bash / Linux / macOS)
#
#   ./run.sh                        # 1000-user read load against localhost
#   ./run.sh -e PEAK_VUS=500        # override peak concurrency
#   ./run.sh -e BASE_URL=http://host:5000/api/v1
#
# Reports land in load-tests/reports/ (summary.html, summary.json).
set -euo pipefail
cd "$(dirname "$0")"

K6="./.bin/k6.exe"
[ -x "$K6" ] || K6="./.bin/k6"
command -v "$K6" >/dev/null 2>&1 || K6="k6"

mkdir -p reports
"$K6" run k6/main.js "$@"
