# How to Start the Wellbeing Support Chatbot

## ⚠️ CRITICAL: Python Must Be Installed First!

**Python is NOT currently installed on your system.** The backend cannot run without it.

### Install Python NOW:
1. Go to https://www.python.org/downloads/
2. Download Python 3.12
3. Run installer and ✅ **CHECK "Add Python to PATH"**
4. See `INSTALL_PYTHON.md` for detailed instructions

### Check Your System:
Run `check_requirements.bat` to see what's missing.

## The chatbot requires THREE things to be running:

### 1. Ollama (AI Model Server)
Open a terminal/command prompt and run:
```bash
ollama serve
```
Leave this running in the background.

### 2. Flask Backend (API Server)

**Option A: Use the batch file (Recommended)**
Double-click `backend\run_backend.bat`

**Option B: Manual start**
Open a NEW terminal/command prompt and run:
```bash
cd backend
python app.py
```

**If Python is not installed:**
The batch file will tell you and stop. Install Python first!

You should see:
```
============================================================
WELLBEING CHATBOT STARTUP CHECK
============================================================
Configuration:
  Ollama URL: http://localhost:11434
  Model: llama3.2:3b
------------------------------------------------------------
Checking Ollama connection...
✓ Ollama is running
Checking model llama3.2:3b...
✓ Model llama3.2:3b is working
------------------------------------------------------------
✅ ALL SYSTEMS READY
Server will run on http://localhost:5000
Test endpoint: http://localhost:5000/api/test
============================================================
```

If you see any errors:
- "Ollama is NOT running" → Run `ollama serve` first
- "Model not found" → Run `ollama pull llama3.2:3b`

### 3. Frontend (Already Running)
The frontend should already be running at http://localhost:8080

## Using the Chatbot:

1. Go to http://localhost:8080
2. Click on "Wellbeing Support" (purple card with heart icon)
3. Check the left sidebar - it should show "Connected to support service" ✅
4. If it shows "Service offline" 🔴:
   - Make sure you've started the Flask backend (step 2 above)
   - Click "Retry Connection" button
   - Check the browser console (F12) for error details

## Quick Troubleshooting:

### "Service offline" error:
- The Flask backend isn't running
- Solution: Run `python app.py` in the backend folder

### "Cannot connect to AI service" error:
- Ollama isn't running
- Solution: Run `ollama serve` in a terminal

### Slow responses:
- First time using the model, it's loading
- Wait 10-15 seconds for the model to warm up

## Test the Connection:
Open http://localhost:5000/api/test in your browser
You should see:
```json
{
  "ready": true,
  "ollama_status": "connected",
  "model_status": "available"
}
```

## Console Output:
Open browser developer tools (F12) to see detailed connection logs:
- ✅ Backend connected successfully
- ❌ Cannot connect to backend
- Detailed error messages for debugging