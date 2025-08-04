@echo off
REM Notepad Clone Startup Script
REM This script starts the Electron notepad app with hidden console

REM Change to the notepad-clone directory
cd /d "%~dp0notepad-clone"

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    npm install >nul 2>&1
)

REM Kill any existing electron processes for this app to prevent conflicts
taskkill /f /im electron.exe >nul 2>&1

REM Start the Electron app in background with hidden console
start /b cmd /c "npm start >nul 2>&1"

REM Exit this script immediately (console window will close)
exit