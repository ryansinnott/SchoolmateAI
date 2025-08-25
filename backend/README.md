# Wellbeing Support Backend

This Flask backend provides the API for the Wellbeing Support chatbot, integrating with Ollama for AI responses.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install and run Ollama:**
   - Download Ollama from https://ollama.ai
   - Install the Mistral model:
     ```bash
     ollama pull mistral:7b-instruct-q4_0
     ```
   - Ensure Ollama is running on http://localhost:11434

3. **Run the Flask server:**
   ```bash
   python app.py
   ```
   The server will start on http://localhost:5000

## API Endpoints

### POST /api/chat/wellbeing
Send a message to the wellbeing chatbot.

**Request body:**
```json
{
  "message": "I'm feeling stressed about exams",
  "student_id": "12345",
  "conversation_history": []
}
```

**Response:**
```json
{
  "response": "I understand exam stress can be really tough...",
  "safety_level": "SAFE"
}
```

### GET /api/health
Check the health status of the API and Ollama connection.

## Safety Features

- **Crisis Detection:** Automatically detects crisis keywords and provides immediate help resources
- **Concern Monitoring:** Identifies concerning messages and adds supportive notes
- **Logging:** Concerning conversations are logged for counselor review in `wellbeing_logs/`

## Testing

Test the crisis detection system:
```bash
curl -X POST http://localhost:5000/api/chat/wellbeing \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel stressed", "student_id": "test123"}'
```

## Important Notes

- This system is designed for educational support only
- It does not replace professional mental health services
- All crisis situations are logged and should be reviewed by school counselors
- Ensure proper privacy and data protection measures are in place