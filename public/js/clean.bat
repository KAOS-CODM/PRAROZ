@echo off
echo terminating unecessary background processes....
timeout /t 2 >nul

:: List of known safe-to-clear processess (add or remove as needed)
set PROCESSES-OneDrive.exe SkypeApp.exe Whatsapp.exe spoolsv.exe notepad.exe calculator.exe

for %%P in (%PROCESSES%) do (
taskkill /f /im %%P > nul 2>&1
if not errorlevel 1 (
echo Terminated %%P
)else(echo %%P not running or could not be terminated.
)
)

echo cleaning temporary files....
del /q /f /s "%TEMP%\*" >nul 2>&1
echo tempfiles cleaned

echo.
echo Background cleanup complete.
pause