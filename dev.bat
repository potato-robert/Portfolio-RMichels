@echo off
setlocal EnableExtensions
cd /d "%~dp0"

rem Cursor/npm sometimes inject an invalid user-level "devdir" config (see docs/AUDIT.md).
if defined npm_config_devdir set "npm_config_devdir="

where node >nul 2>nul
if errorlevel 1 (
  echo [dev.bat] Node.js was not found on PATH. Install Node.js 22.12 or newer.
  exit /b 1
)

node -e "const p=process.versions.node.split('.').map(Number);if(p[0]<22||(p[0]===22&&p[1]<12)){console.error('[dev.bat] Need Node >= 22.12.0, got '+process.versions.node);process.exit(1)}" 
if errorlevel 1 exit /b 1

node scripts/stop-dev-server.mjs
if errorlevel 1 exit /b 1

node scripts/ensure-dev-deps.mjs
if errorlevel 1 exit /b 1

call npm run dev
exit /b %ERRORLEVEL%
