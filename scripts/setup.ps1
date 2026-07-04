# Shopify CRO Opportunity Engine Developer Setup Script
# Run this script to verify dependencies and initialize the workspace configurations.

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Shopify CRO Opportunity Engine Workspace Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Check Node.js installation
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "[SUCCESS] Node.js is installed ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Warning "[ERROR] Node.js is not installed. Please install Node.js v18+ before proceeding."
    Exit 1
}

# 2. Check for .env file configuration
$envFilePath = Join-Path $PSScriptRoot "..\.env"
$exampleFilePath = Join-Path $PSScriptRoot "..\.env.example"

if (-Not (Test-Path $envFilePath)) {
    Write-Host "[INFO] Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item $exampleFilePath $envFilePath
    Write-Host "[SUCCESS] .env file created. Please update it with your GEMINI_API_KEY." -ForegroundColor Green
} else {
    Write-Host "[INFO] .env file already exists." -ForegroundColor Gray
}

# 3. Create missing directories
$dirs = @(
    "..\src\core",
    "..\src\features",
    "..\src\server",
    "..\src\ui",
    "..\public",
    "..\prompts\system_prompts",
    "..\prompts\templates"
)

foreach ($dir in $dirs) {
    $targetPath = Resolve-Path (Join-Path $PSScriptRoot $dir) -ErrorAction SilentlyContinue
    if (-Not $targetPath) {
        $newPath = Join-Path $PSScriptRoot $dir
        New-Item -ItemType Directory -Force -Path $newPath | Out-Null
        Write-Host "[INFO] Created directory: $dir" -ForegroundColor Gray
    }
}

Write-Host "---------------------------------------------"
Write-Host "[COMPLETED] Workspace is verified and ready for Sprint 1." -ForegroundColor Green
Write-Host "Next Steps:" -ForegroundColor Gray
Write-Host "  1. Add your Google Gemini API Key in the .env file." -ForegroundColor Gray
Write-Host "  2. Run 'npm install' to fetch dependencies." -ForegroundColor Gray
Write-Host "  3. Run 'npm run dev' to start the Express API engine." -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Cyan
