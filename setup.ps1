# Campus Connect - Upgrade Setup Script (PowerShell)

Write-Host "========================================" -ForegroundColor Blue
Write-Host "   Campus Connect - Upgrade Setup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Check if .env files exist
Write-Host "Step 1: Checking environment files..." -ForegroundColor Yellow
if (-not (Test-Path "server\.env")) {
    Write-Host "Creating server\.env from example..." -ForegroundColor Yellow
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "✓ Created server\.env" -ForegroundColor Green
    Write-Host "⚠ IMPORTANT: Edit server\.env and add your HUGGING_FACE_TOKEN" -ForegroundColor Red
} else {
    Write-Host "✓ server\.env exists" -ForegroundColor Green
}

if (-not (Test-Path "client\.env")) {
    Write-Host "Creating client\.env from example..." -ForegroundColor Yellow
    Copy-Item "client\.env.example" "client\.env"
    Write-Host "✓ Created client\.env" -ForegroundColor Green
} else {
    Write-Host "✓ client\.env exists" -ForegroundColor Green
}

Write-Host ""

# Install server dependencies
Write-Host "Step 2: Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install server dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""

# Install client dependencies
Write-Host "Step 3: Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install client dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""

# Run backend tests
Write-Host "Step 4: Running backend tests..." -ForegroundColor Yellow
Set-Location server
npm test
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All backend tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some backend tests failed" -ForegroundColor Red
}
Set-Location ..

Write-Host ""

# Run frontend tests
Write-Host "Step 5: Running frontend tests..." -ForegroundColor Yellow
Set-Location client
npm test -- --run
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All frontend tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some frontend tests failed" -ForegroundColor Red
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit " -NoNewline; Write-Host "server\.env" -ForegroundColor Yellow -NoNewline; Write-Host " and add your HUGGING_FACE_TOKEN"
Write-Host "2. Run " -NoNewline; Write-Host "docker-compose up" -ForegroundColor Yellow -NoNewline; Write-Host " to start the application"
Write-Host "3. Visit " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Yellow -NoNewline; Write-Host " to see the app"
Write-Host ""
Write-Host "For more information, see " -NoNewline; Write-Host "UPGRADES.md" -ForegroundColor Yellow
Write-Host ""
