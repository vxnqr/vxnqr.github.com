@echo off
cd /d "%~dp0"
where py >nul 2>nul && (py update_media.py) || (python update_media.py)
echo.
pause
