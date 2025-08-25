# ⚠️ Python Installation Required

The Wellbeing Support chatbot backend requires Python to run. **Python is not currently installed on your system.**

## Quick Install Instructions:

### Option 1: Download from Python.org (Recommended)

1. **Download Python 3.11 or 3.12:**
   - Go to: https://www.python.org/downloads/
   - Click the yellow "Download Python 3.12.x" button
   - Choose **Windows installer (64-bit)**

2. **Install Python:**
   - Run the downloaded installer
   - ✅ **IMPORTANT: Check "Add Python to PATH"** at the bottom of the installer
   - Click "Install Now"
   - Wait for installation to complete

3. **Verify Installation:**
   Open a NEW command prompt and run:
   ```bash
   python --version
   ```
   You should see: `Python 3.12.x`

### Option 2: Install from Microsoft Store

1. Open Microsoft Store
2. Search for "Python 3.12"
3. Click "Get" or "Install"
4. Wait for installation

### After Installing Python:

1. **Install required packages:**
   ```bash
   cd backend
   pip install flask flask-cors requests
   ```

2. **Run the backend:**
   ```bash
   python app.py
   ```

## Troubleshooting:

### "Python not found" error after installation:
- You didn't check "Add Python to PATH" during installation
- Solution: Reinstall Python and check the PATH option, OR
- Manually add Python to PATH:
  1. Search for "Environment Variables" in Windows
  2. Edit System Environment Variables
  3. Add Python installation folder to PATH

### "pip not found" error:
- pip wasn't installed with Python
- Solution: Run `python -m ensurepip --upgrade`

### Still having issues?
Try using the full path to Python:
```bash
C:\Users\[YourUsername]\AppData\Local\Programs\Python\Python312\python.exe app.py
```

## Quick Check:
Run this to see if Python is working:
```bash
python -c "print('Python is working!')"
```

If you see "Python is working!" then you're ready to run the backend!