@echo off
echo ============================================================
echo WELLBEING SUPPORT BACKEND STARTUP
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo.
    echo Please install Python first:
    echo 1. Go to https://www.python.org/downloads/
    echo 2. Download Python 3.11 or 3.12
    echo 3. Run installer and CHECK "Add Python to PATH"
    echo.
    echo For detailed instructions, see INSTALL_PYTHON.md
    echo.
    pause
    exit /b 1
)

echo [OK] Python is installed
python --version
echo.

echo Checking for Ollama...
echo Please ensure you have:
echo 1. Ollama running (run 'ollama serve' in another window)
echo 2. Model llama3.2:3b installed (run 'ollama pull llama3.2:3b')
echo.

echo Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Some dependencies may not have installed correctly
    echo Trying individual installs...
    pip install flask
    pip install flask-cors
    pip install requests
)
echo.

echo ============================================================
echo Starting Flask server on http://localhost:5000
echo ============================================================
echo.
echo If you see startup errors:
echo 1. Make sure Ollama is running: ollama serve
echo 2. Make sure model is installed: ollama pull llama3.2:3b
echo 3. Check firewall isn't blocking port 5000
echo.

python app.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Flask server failed to start!
    echo Check the error messages above.
    echo.
)

pause