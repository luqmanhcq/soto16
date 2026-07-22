Write-Host "=== Step 1: Cleanup ===" -ForegroundColor Cyan
Remove-Item -Path "c:\wwwroot\soto16\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\wwwroot\soto16\package-lock.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\wwwroot\soto16\pages" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleanup done."

Write-Host "=== Step 2: npm install ===" -ForegroundColor Cyan
Set-Location "c:\wwwroot\soto16"
npm install 2>&1 | Write-Host

Write-Host "=== Step 3: Check Next.js version ===" -ForegroundColor Cyan
$nextPkg = Get-Content "c:\wwwroot\soto16\node_modules\next\package.json" | ConvertFrom-Json
Write-Host "Next.js version: $($nextPkg.version)"

Write-Host "=== DONE ===" -ForegroundColor Green
