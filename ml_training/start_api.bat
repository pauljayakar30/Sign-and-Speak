@echo off
echo Starting ISL Prediction API Server...
cd /d "%~dp0"
call isl_env\Scripts\activate.bat
python prediction_api.py
pause
