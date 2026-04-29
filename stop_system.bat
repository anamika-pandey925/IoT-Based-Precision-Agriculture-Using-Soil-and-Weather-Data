@echo off
title Stop IoT System
echo Stopping IoT Precision Agriculture Backend...
taskkill /F /IM python.exe
echo.
echo Server Stopped Successfully.
pause
