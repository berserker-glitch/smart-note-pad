@echo off
REM Force Quit Notepad Clone
REM Use this script if the app doesn't close properly

echo Force closing Notepad Clone processes...

REM Kill all electron processes
taskkill /f /im electron.exe 2>nul

REM Kill any node processes that might be running npm start
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo csv ^| find "node.exe"') do (
    wmic process where "name='node.exe' and commandline like '%%npm%%'" delete 2>nul
)

echo All Notepad Clone processes have been terminated.
pause