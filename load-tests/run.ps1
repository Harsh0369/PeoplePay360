# PeoplePay360 — k6 load-test runner (Windows / PowerShell)
#
#   ./run.ps1                       # 1000-user read load against localhost
#   ./run.ps1 -e PEAK_VUS=500       # override peak concurrency
#   ./run.ps1 -e BASE_URL=http://host:5000/api/v1
#
# Reports land in load-tests/reports/ (summary.html, summary.json).

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$k6 = Join-Path $root ".bin\k6.exe"
if (-not (Test-Path $k6)) {
  $k6 = "k6" # fall back to k6 on PATH
}

New-Item -ItemType Directory -Force -Path (Join-Path $root "reports") | Out-Null

& $k6 run "k6/main.js" @args
