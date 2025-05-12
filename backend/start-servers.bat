@echo off
echo Starting Alfanio servers...
cd /d "%~dp0"
call pm2 start ecosystem.config.cjs
echo All servers started successfully!
pause
