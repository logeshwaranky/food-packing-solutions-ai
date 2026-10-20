@echo off
cd /d "%~dp0"
echo ========================================================
echo Starting Food Packing Solutions AI Backend on port 8000...
echo ========================================================
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
) else (
    python -m uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
)
pause

