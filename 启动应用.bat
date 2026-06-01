@echo off
chcp 65001 >nul
title PawsAdopt - Start
echo ============================================
echo   PawsAdopt - Pet Adoption App
echo ============================================
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting app...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo.
call npm run dev:all
pause
