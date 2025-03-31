@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

:: Create a temp folder for merging
mkdir temp_merged 2>nul

:: Minify all non-minified CSS files
for %%f in (*.css) do (
    if /I not "%%~xf"==".min.css" (
        echo Minifying %%f...
        cleancss -o "%%~nf.min.css" "%%f"
        del "%%f"
    )
)

:: Move all .min.css files into the temp_merged folder
for %%f in (*.min.css) do (
    set "name=%%~nf"
    set "name=!name:.min=!"
    
    if exist "temp_merged\!name!.min.css" (
        echo Merging !name!.min.css...
        type "%%f" >> "temp_merged\!name!.min.css"
        del "%%f"
    ) else (
        move "%%f" "temp_merged\!name!.min.css" >nul
    )
)

:: Move merged files back
move temp_merged\*.min.css . >nul
rd temp_merged

echo Minification and merging completed!
pause
