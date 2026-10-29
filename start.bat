@echo off
setlocal
title TaskFlow — Smart Task Manager Launcher

echo ======================================================
echo    TaskFlow - Smart Task Manager (Zero-NPM Launcher)
echo ======================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [✓] Node.js runtime detected.
    echo [✓] Starting lightweight local server without npm...
    echo.
    echo Opening TaskFlow in your default browser...
    node server.js
) else (
    echo [!] Node.js not detected in PATH.
    echo [✓] Opening TaskFlow Standalone directly in your browser...
    start "" "%~dp0standalone.html"
)

pause

