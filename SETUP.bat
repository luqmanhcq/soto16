@echo off
echo === SI-SOTO Setup Script ===
echo.
cd /d c:\wwwroot\soto16
echo [1/4] Removing node_modules...
rmdir /s /q node_modules 2>nul
del /q package-lock.json 2>nul
rmdir /s /q pages 2>nul
echo [2/4] Running npm install (this takes 1-3 minutes)...
call npm install
echo.
echo [3/4] Checking Next.js version...
node -e "console.log('Next.js', require('next/package.json').version)"
echo.
echo [4/4] Starting dev server...
call npm run dev
