@echo off
chcp 65001 >nul
echo ============================================
echo  🐾 PawsAdopt 宠物领养应用 - 一键启动
echo ============================================
echo.
echo 正在安装依赖...
call npm install
echo.
echo 正在启动前后端服务...
echo 前端: http://localhost:3000
echo 后端: http://localhost:4000
echo.
call npm run dev:all
pause
