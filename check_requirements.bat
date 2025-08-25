@echo off
echo ============================================================
echo WELLBEING CHATBOT - SYSTEM REQUIREMENTS CHECK
echo ============================================================
echo.

set PYTHON_OK=0
set OLLAMA_OK=0
set ALL_OK=1

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python is installed
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo     Version: %%i
    set PYTHON_OK=1
) else (
    echo [MISSING] Python is not installed
    echo     Solution: See INSTALL_PYTHON.md for installation instructions
    set ALL_OK=0
)
echo.

echo Checking pip...
if %PYTHON_OK% equ 1 (
    pip --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] pip is installed
        for /f "tokens=2" %%i in ('pip --version 2^>^&1') do echo     Version: %%i
    ) else (
        echo [MISSING] pip is not installed
        echo     Solution: Run 'python -m ensurepip --upgrade'
        set ALL_OK=0
    )
) else (
    echo [SKIPPED] Cannot check pip without Python
)
echo.

echo Checking Python packages...
if %PYTHON_OK% equ 1 (
    python -c "import flask" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Flask is installed
    ) else (
        echo [MISSING] Flask is not installed
        echo     Solution: Run 'pip install flask'
        set ALL_OK=0
    )
    
    python -c "import flask_cors" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Flask-CORS is installed
    ) else (
        echo [MISSING] Flask-CORS is not installed
        echo     Solution: Run 'pip install flask-cors'
        set ALL_OK=0
    )
    
    python -c "import requests" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Requests is installed
    ) else (
        echo [MISSING] Requests is not installed
        echo     Solution: Run 'pip install requests'
        set ALL_OK=0
    )
) else (
    echo [SKIPPED] Cannot check packages without Python
)
echo.

echo Checking Ollama...
curl -s http://localhost:11434 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Ollama is running on port 11434
    set OLLAMA_OK=1
) else (
    echo [WARNING] Ollama is not running
    echo     Solution: Run 'ollama serve' in a separate terminal
    set ALL_OK=0
)
echo.

echo Checking Ollama model...
if %OLLAMA_OK% equ 1 (
    curl -s http://localhost:11434/api/tags | findstr "llama3.2:3b" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Model llama3.2:3b is installed
    ) else (
        echo [WARNING] Model llama3.2:3b is not installed
        echo     Solution: Run 'ollama pull llama3.2:3b'
        set ALL_OK=0
    )
) else (
    echo [SKIPPED] Cannot check model without Ollama running
)
echo.

echo Checking Flask backend...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Flask backend is running on port 5000
) else (
    echo [INFO] Flask backend is not running
    echo     Solution: Run 'python app.py' in the backend folder
)
echo.

echo Checking frontend...
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 8080
) else (
    echo [INFO] Frontend is not running
    echo     Solution: Run 'npm run dev' in the main folder
)
echo.

echo ============================================================
if %ALL_OK% equ 1 (
    if %PYTHON_OK% equ 1 (
        echo RESULT: All core requirements are installed!
        echo.
        echo Next steps:
        echo 1. Make sure Ollama is running: ollama serve
        echo 2. Start the backend: cd backend ^&^& python app.py
        echo 3. Open http://localhost:8080 in your browser
    )
) else (
    echo RESULT: Some requirements are missing!
    echo.
    echo Please fix the issues above, then run this check again.
    echo.
    echo Quick fix for all Python packages:
    echo   cd backend
    echo   pip install -r requirements.txt
)
echo ============================================================
echo.
pause