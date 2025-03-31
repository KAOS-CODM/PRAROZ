@echo off
cd /d "%~dp0"
echo Minifying JavaScript files...

:: Minify non-minified JS files and remove the originals
for %%f in (*.js) do (
    if /I not "%%~xf"==".min.js" (
        echo Minifying %%f...
        uglifyjs "%%f" -o "%%~nf.min.js" --compress --mangle
        del "%%f"
    )
)

:: Merge duplicate .min.js files
for %%f in (*.min.js) do (
    for %%g in (*.min.js) do (
        if /I not "%%f"=="%%g" if "%%~nf"=="%%~ng" (
            echo Merging %%f and %%g...
            type "%%f" "%%g" > "merged_%%f"
            del "%%f"
            del "%%g"
            rename "merged_%%f" "%%f"
        )
    )
)

echo JavaScript minification and merging complete!
pause
