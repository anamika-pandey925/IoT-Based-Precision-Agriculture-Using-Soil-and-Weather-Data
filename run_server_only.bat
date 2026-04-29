@echo off
title Only Run Server
echo ==================================================
echo   Debugging Agriculture Server
echo ==================================================
echo.
echo [1/2] Checking Dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies.
    echo Please check your python installation and internet.
    pause
    exit /b
)

echo.
echo [2/2] Starting Flask Server...
echo Stop this server by pressing Ctrl+C
echo.
python python/app.py
pause
