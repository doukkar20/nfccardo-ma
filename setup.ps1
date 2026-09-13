$ErrorActionPreference = "Stop"
Write-Host "Setting up NFCcardo.ma..." -ForegroundColor Magenta
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 22+ is required: https://nodejs.org" }
npm install
if (-not (Test-Path ".env.local")) { Copy-Item ".env.example" ".env.local"; Write-Host "Created .env.local — add your Supabase credentials." -ForegroundColor Yellow }
npm run build
Write-Host "Ready. Run: npm run dev" -ForegroundColor Green
