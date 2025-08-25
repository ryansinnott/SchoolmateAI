# Schoolmate AI - Educational AI Tutoring System

## Overview

Schoolmate AI is an innovative educational support system that provides personalized AI tutoring assistance to students aged 12-18. The platform features multiple specialized chatbot personalities, including academic tutors, wellbeing support, and customizable learning companions designed to enhance the educational experience.

## Features

- **Multiple AI Tutors**: Pre-configured chatbots including:
  - Wellbeing Support - Emotional and mental health support companion
  - Holden Caulfield - Literary analysis assistant for "The Catcher in the Rye"
  - Custom Chatbot Creator - Design your own AI tutor with specific expertise

- **Personalized Learning**: Create custom AI tutors tailored to specific subjects and learning styles
- **Safe & Supportive Environment**: Built-in safety features and crisis support resources
- **Persistent Storage**: Save and manage multiple custom chatbot configurations
- **Real-time Chat Interface**: Engaging conversational UI optimized for educational interactions

## System Requirements

### Frontend Requirements
- Node.js 18.0 or higher
- npm 9.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### AI Backend Requirements
- Python 3.8 or higher
- Ollama (Local AI model server)
- Llama 3.2:3b model (approximately 2GB)
- Minimum 8GB RAM recommended
- 4GB free disk space for model storage

## Installation Guide

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd study-buddy-desk
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Step 4: Install and Configure Ollama

#### Windows:
1. Download Ollama from [https://ollama.ai](https://ollama.ai)
2. Run the installer
3. Open a terminal and run:
```bash
ollama serve
```

#### macOS/Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

### Step 5: Download Required AI Model
Open a new terminal and run:
```bash
ollama pull llama3.2:3b
```

This will download the Llama 3.2 (3 billion parameter) model, which is optimized for conversational AI and educational support.

## Running the Application

### Start the AI Backend Server
```bash
cd backend
python app.py
```
The backend will start on `http://localhost:5000`

### Start the Frontend Development Server
In a new terminal:
```bash
npm run dev
```
The application will be available at `http://localhost:8080`

### Verify Installation
1. Navigate to `http://localhost:8080`
2. Check that the connection status shows "Connected" in any chat interface
3. Test by sending a message to one of the AI tutors

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - React component library
- **React Router** - Client-side routing

### Backend
- **Flask** - Python web framework
- **Ollama** - Local AI model serving
- **Llama 3.2:3b** - Large language model for AI responses
- **Flask-CORS** - Cross-origin resource sharing

## Legal Notices and Disclaimers

### Educational Use Disclaimer
Schoolmate AI is designed as an educational support tool and should not replace professional educational instruction, counseling, or medical advice. Students should always consult with qualified educators, counselors, or healthcare professionals for specific needs.

### Privacy Notice
- All conversations are processed locally when using the Ollama backend
- Chat histories are stored in browser localStorage and are not transmitted to external servers
- Concerning messages may be logged locally for safety monitoring (configurable)
- No personal data is collected or transmitted without explicit user consent

### Age-Appropriate Content
This system is designed for students aged 12-18. Adult supervision is recommended for younger users. The system includes safety features to detect and respond to crisis situations.

### Crisis Support Resources
The wellbeing chatbot includes automatic detection for crisis keywords and provides immediate resources including:
- Kids Helpline: 1800 55 1800 (Australia)
- Lifeline: 13 11 14 (Australia)
- Emergency Services: 000 (Australia)

Users in other regions should configure appropriate local crisis resources.

### Medical and Professional Advice Disclaimer
This software does not provide medical, psychological, or professional counseling services. It is an educational support tool only. Users experiencing mental health issues should seek help from qualified professionals.

### No Warranty
This software is provided "as is" without warranty of any kind, express or implied. The authors and contributors are not liable for any damages arising from the use of this software.

## Contributing

We welcome contributions to improve Schoolmate AI! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all contributions are appropriate for educational use and maintain the safety features of the system.

## License

MIT License

Copyright (c) 2024 Schoolmate AI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Security Configuration

### Production Deployment

When deploying to production, ensure you follow these security best practices:

1. **Create a `.env` file** from `.env.example` in the backend directory:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Configure environment variables**:
   - Set `FLASK_DEBUG=False` (never enable debug in production)
   - Set `HOST=127.0.0.1` to restrict access to localhost only
   - Update `CORS_ORIGINS` to match your production domain
   - Generate a strong `SECRET_KEY` for session management
   - Set appropriate `LOG_LEVEL` (INFO or WARNING for production)

3. **Network Security**:
   - The backend binds to `127.0.0.1` by default (localhost only)
   - Use a reverse proxy (nginx/Apache) for external access
   - Implement HTTPS/TLS for all production deployments
   - Configure firewall rules to restrict backend port access

4. **Data Privacy**:
   - Session IDs are generated using cryptographically secure methods
   - Student IDs are anonymized (only first 8 chars displayed)
   - Chat histories stored in browser localStorage (not transmitted)
   - Safety logs are local only and should be secured appropriately

5. **Safety Monitoring**:
   - Crisis detection logs are stored in `wellbeing_logs/`
   - Ensure log directory has appropriate file permissions
   - Regularly review logs for student safety
   - Set `ENABLE_SAFETY_LOGGING=False` to disable if not needed

### Development vs Production

| Setting | Development | Production |
|---------|------------|------------|
| FLASK_DEBUG | False | False (must never be True) |
| HOST | 127.0.0.1 | 127.0.0.1 (use reverse proxy) |
| CORS_ORIGINS | http://localhost:8080 | https://yourdomain.com |
| LOG_LEVEL | DEBUG or INFO | INFO or WARNING |
| ENABLE_SAFETY_LOGGING | True | True (recommended) |

### Security Features

- **No hardcoded credentials**: All sensitive config in environment variables
- **Session-based identification**: Unique session IDs per browser session
- **CORS restrictions**: Only specified origins can access the API
- **Local-only by default**: Backend binds to localhost, not network
- **Debug mode disabled**: Prevents information disclosure in production
- **Sanitized logging**: Sensitive data truncated in logs

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## Acknowledgments

- Powered by Llama 3.2 language model via Ollama
- UI components from shadcn/ui
- Built with React and Vite