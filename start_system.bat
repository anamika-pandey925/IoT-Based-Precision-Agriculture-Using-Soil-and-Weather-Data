@echo off
title IoT Precision Agriculture - Server Control
echo ==================================================
echo   Starting IoT Precision Agriculture System
echo ==================================================
echo.

echo [1/3] Checking Dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not install dependencies. Check your internet connection.
    pause
    exit /b
)

echo.
echo [2/3] Starting Backend Server...
:: Start Python in a new visible window so we can see errors
start "Agriculture Backend" cmd /k python python/app.py

:: Wait for server to initialize
timeout /t 5 >nul

echo [3/3] Opening Dashboard...
:: Open the HTML file in the default browser
start https://precision-agriculture.netlify.app/

echo.
echo [3/3] Global Access (Optional)
echo To access this dashboard from OUTSIDE your home WiFi,
echo we can start a secure tunnel.
echo.
set /p tunnel="Start Global Access Tunnel? (y/n): "
if /i "%tunnel%"=="y" start start_tunnel.bat

echo.
echo ==================================================
echo   System is LIVE!
echo   You can minimize this window.
echo   To stop the server, run 'stop_system.bat'
echo ==================================================
pause
