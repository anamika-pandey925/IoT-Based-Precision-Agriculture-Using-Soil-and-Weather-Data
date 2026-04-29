@echo off
title IoT Precision Agriculture - Global Access Tunnel
echo ==================================================
echo   Starting Global Access Tunnel
echo ==================================================
echo.
echo This window will display a PUBLIC URL.
echo You can use that URL to access your dashboard from ANYWHERE.
echo.
echo NOTE: You might see a warning about "Host key verification".
echo       Just type 'yes' if asked.
echo.
echo Connecting to Pinggy.io...
echo.
ssh -p 443 -R0:localhost:5000 a.pinggy.io
pause
