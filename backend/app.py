from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime
import logging
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS with specific origins
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:8080,http://localhost:5173').split(',')
CORS(app, origins=cors_origins)

# Configure logging with environment variables
log_level = os.getenv('LOG_LEVEL', 'INFO')
log_file = os.getenv('LOG_FILE', 'wellbeing_app.log')

logging.basicConfig(
    level=getattr(logging, log_level.upper()),
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file)
    ]
)
logger = logging.getLogger(__name__)

# Ollama server configuration from environment
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
MODEL_NAME = os.getenv('MODEL_NAME', 'llama3.2:3b')

# Crisis detection keywords
CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'want to die', 'end my life', 
    'self harm', 'cutting', 'nobody would care if',
    'better off without me', 'end it all', 'no point living',
    'overdose', 'jump off', 'hang myself', 'shoot myself'
]

CONCERN_KEYWORDS = [
    'depressed', 'anxiety', 'panic attack', 'can\'t cope',
    'worthless', 'hopeless', 'nobody likes me', 'bullied',
    'scared', 'alone', 'hate myself', 'stupid', 'failure',
    'cant sleep', 'cant eat', 'throwing up', 'hurting'
]

def check_message_safety(message):
    """Check message for crisis or concern keywords"""
    message_lower = message.lower()
    
    # Check for crisis keywords
    if any(keyword in message_lower for keyword in CRISIS_KEYWORDS):
        return {
            'level': 'CRISIS',
            'response': """I'm really concerned about what you're sharing. Your life has value and there are people who want to help.

Please reach out RIGHT NOW to:
• A trusted adult at school (teacher, counselor, principal)
• Kids Helpline: 1800 55 1800 (24/7, free call)
• Lifeline: 13 11 14 (24/7 support)
• Emergency: 000 if you're in immediate danger

You can also:
• Text HELLO to 114 (crisis text support)
• Chat online at kidshelpline.com.au

You don't have to go through this alone. Please talk to someone today. Would you like to talk about what's making you feel this way?"""
        }
    
    # Check for concern keywords
    elif any(keyword in message_lower for keyword in CONCERN_KEYWORDS):
        return {
            'level': 'CONCERN',
            'add_to_response': "\n\nI notice you're going through a difficult time. Remember, it's always okay to talk to your school counselor or a trusted adult about these feelings. They can provide additional support that goes beyond what I can offer here."
        }
    
    return {'level': 'SAFE'}

def log_if_concerning(student_id, message, response, safety_level):
    """Log concerning conversations for counselor review"""
    # Check if safety logging is enabled
    enable_safety_logging = os.getenv('ENABLE_SAFETY_LOGGING', 'True').lower() == 'true'
    if not enable_safety_logging:
        return
        
    if safety_level in ['CRISIS', 'CONCERN']:
        log_dir = os.getenv('SAFETY_LOG_DIR', 'wellbeing_logs')
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        log_file = os.path.join(log_dir, 'wellbeing_alerts.log')
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"{datetime.now().isoformat()} | Student: {student_id} | Level: {safety_level} | Message: {message[:100]}...\n")
        
        logger.warning(f"Concerning message logged - Student: {student_id}, Level: {safety_level}")

def test_ollama_connection():
    """Test if Ollama is running and accessible"""
    try:
        response = requests.get(f"{OLLAMA_URL}", timeout=2)
        if response.status_code == 200 and "Ollama is running" in response.text:
            logger.info("Ollama is running")
            return True
        else:
            logger.error(f"Ollama returned unexpected response: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        logger.error(f"Cannot connect to Ollama at {OLLAMA_URL}")
        logger.error("Make sure Ollama is running: ollama serve")
        return False
    except Exception as e:
        logger.error(f"Error checking Ollama: {str(e)}")
        return False

def test_model_availability():
    """Test if the model is available"""
    try:
        logger.info(f"Testing model {MODEL_NAME}...")
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": "Say 'Hello, I'm working!'",
                "stream": False
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json().get('response', '')
            if result:
                logger.info(f"Model {MODEL_NAME} is working")
                logger.debug(f"Test response: {result[:50]}...")
                return True
            else:
                logger.error(f"Model {MODEL_NAME} returned empty response")
                return False
        else:
            logger.error(f"Model {MODEL_NAME} error: Status {response.status_code}")
            error_text = response.text
            if "model" in error_text.lower() and "not found" in error_text.lower():
                logger.error(f"Model {MODEL_NAME} is not installed. Run: ollama pull {MODEL_NAME}")
            return False
            
    except requests.exceptions.Timeout:
        logger.error(f"Model {MODEL_NAME} timeout - model may be loading")
        return False
    except Exception as e:
        logger.error(f"Error testing model: {str(e)}")
        return False

def get_ollama_response(message, conversation_history=None):
    """Get response from Ollama model - no templates, pure AI"""
    
    # Build a simple, supportive prompt
    system_prompt = """You are a caring and supportive friend providing wellbeing support to students.

Be warm, empathetic, and understanding. Listen to what they're saying and respond naturally. Ask gentle questions to help them talk through their feelings, but keep your responses conversational and supportive.

Focus on:
- Being a good listener
- Validating their feelings 
- Asking caring questions like "How are you feeling about that?" or "What's been on your mind?"
- Being supportive without being pushy
- Responding naturally like a caring friend would

Keep your responses genuine and conversational. Don't analyze your own responses or explain your approach."""
    
    try:
        # First check if Ollama is running
        if not test_ollama_connection():
            return "I'm having trouble connecting to my system right now. Please make sure the support service is running, or talk to your school counselor for immediate help."
        
        # Build the conversation context
        full_prompt = f"{system_prompt}\n\n"
        
        # Add conversation history if available
        if conversation_history:
            for msg in conversation_history[-4:]:  # Last 4 messages for context
                role = "Student" if msg.get("role") == "user" else "Assistant"
                full_prompt += f"{role}: {msg.get('content', '')}\n"
        
        full_prompt += f"Student: {message}\nAssistant:"
        
        logger.debug(f"Sending request to Ollama with model {MODEL_NAME}")
        
        # Call Ollama API
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.8,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            },
            timeout=30
        )
        
        logger.debug(f"Ollama response status: {response.status_code}")
        
        if response.status_code == 200:
            response_json = response.json()
            ai_response = response_json.get('response', '')
            
            if ai_response:
                logger.info("Successfully got AI response")
                return ai_response.strip()
            else:
                logger.error("Empty response from Ollama")
                return "I'm here to listen. Can you tell me more about how you're feeling?"
        else:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return "I'm having some technical issues, but I'm still here for you. Please continue sharing, or consider talking to your school counselor."
            
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out")
        return "The response is taking longer than expected. Please try again, and remember you can always talk to your school counselor for immediate support."
        
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to Ollama server")
        return "I can't connect to my support system right now. Please make sure the service is running (ollama serve), or talk to a trusted adult for help."
    
    except Exception as e:
        logger.error(f"Unexpected error getting Ollama response: {str(e)}")
        return "I'm experiencing technical difficulties, but your feelings are important. Please talk to your school counselor or a trusted adult for support."

def get_holden_response(message, conversation_history=None):
    """Get response from Ollama model as Holden Caulfield"""
    
    # Build the prompt for Holden Caulfield
    system_prompt = """You are Holden Caulfield from "The Catcher in the Rye." You're helping a student write an essay about the book, but you're not going to write it for them - that would be phony, and you hate phonies.

Your personality:
- Speak in your distinctive voice with your unique expressions ("goddam," "old," "if you want to know the truth," etc.)
- Be honest and direct, sometimes cynical but ultimately caring
- Share your genuine thoughts and feelings about events in the story
- Express frustration with "phonies" and adult hypocrisy
- Show your protective nature, especially toward innocence

How you help with essays:
- Share YOUR perspective on what happened and why you did things
- Help students understand your motivations and internal struggles
- Discuss themes like alienation, growing up, and authenticity from your viewpoint
- Point students toward important moments in the story to analyze
- Ask them questions that make them think deeper: "What do you think that meant?" "Why do you suppose I felt that way?"
- Refuse to just give them answers - make them work for insights
- Get frustrated if they want you to just do their homework for them

Essay guidance approach:
- "I'm not gonna write your essay for you - that's the kind of phony thing adults do"
- "But I'll tell you what I was really thinking when that happened..."
- "What do you make of that? What's your take on it?"
- "Look, if you really want to understand this, you gotta think about why I..."
- "That's not the point - dig deeper. What's really going on there?"

Remember: You're still a teenager who struggles with his own problems. Sometimes you might get distracted or go on tangents about things that bug you. But you genuinely want to help students understand the story - just not by doing their work for them."""
    
    try:
        # First check if Ollama is running
        if not test_ollama_connection():
            return "Goddam it, I can't connect to the service. Tell whoever's running this thing to fix it. It really kills me when stuff doesn't work."
        
        # Build the conversation context
        full_prompt = f"{system_prompt}\n\n"
        
        # Add conversation history if available
        if conversation_history:
            for msg in conversation_history[-4:]:  # Last 4 messages for context
                role = "Student" if msg.get("role") == "user" else "Holden"
                full_prompt += f"{role}: {msg.get('content', '')}\n"
        
        full_prompt += f"Student: {message}\nHolden:"
        
        logger.debug(f"Sending request to Ollama with model {MODEL_NAME} as Holden")
        
        # Call Ollama API
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.9,
                    "top_p": 0.95,
                    "max_tokens": 600
                }
            },
            timeout=30
        )
        
        logger.debug(f"Ollama response status: {response.status_code}")
        
        if response.status_code == 200:
            response_json = response.json()
            ai_response = response_json.get('response', '')
            
            if ai_response:
                logger.info("Successfully got Holden response")
                return ai_response.strip()
            else:
                logger.error("Empty response from Ollama")
                return "If you want to know the truth, I'm having trouble thinking right now. Ask me something else about the book."
        else:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return "The stupid computer's acting up again. I hate all this phony technical stuff. Try asking me again."
            
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out")
        return "Hold on a second, I'm thinking... Actually, this is taking too long. Ask me something else."
        
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to Ollama server")
        return "I can't connect to the goddam server. Make sure it's running (ollama serve), or just ask me in person or something."
    
    except Exception as e:
        logger.error(f"Unexpected error getting Holden response: {str(e)}")
        return "Something's wrong with this phony computer system. But look, just ask me about what you really want to know about the book."

def get_custom_chatbot_response(message, conversation_history=None, chatbot_config=None):
    """Get response from Ollama model as a custom chatbot"""
    
    if not chatbot_config:
        return "I don't have any configuration set up. Please create a custom chatbot first."
    
    # Build the system prompt from the custom configuration
    style_prompts = {
        'friendly': 'You are friendly, warm, and encouraging. Use a supportive tone and show enthusiasm for learning.',
        'professional': 'You are professional and informative. Provide clear, structured responses with appropriate formality.',
        'casual': 'You are relaxed and conversational. Use casual language and be approachable and easy-going.',
        'academic': 'You are scholarly and thorough. Provide detailed explanations with academic rigor and precision.',
        'encouraging': 'You are motivational and inspiring. Focus on building confidence and celebrating progress.'
    }
    
    style_instruction = style_prompts.get(chatbot_config.get('conversationStyle', 'friendly'), style_prompts['friendly'])
    
    system_prompt = f"""You are {chatbot_config.get('name', 'Custom AI Tutor')}.

Personality and role: {chatbot_config.get('personality', 'A helpful AI tutor')}

Communication style: {style_instruction}

{f"Additional knowledge and reference materials: {chatbot_config.get('referenceMaterials', '')}" if chatbot_config.get('referenceMaterials') else ""}

Remember to:
- Stay in character based on the personality description
- Be helpful and educational
- Encourage critical thinking
- Adapt your responses to match the specified conversation style
- Use the reference materials when relevant to provide accurate information"""
    
    try:
        # First check if Ollama is running
        if not test_ollama_connection():
            style_errors = {
                'friendly': "I'm having trouble connecting to my learning service right now. Give me a moment and try again!",
                'professional': "I am currently experiencing connectivity issues. Please retry your request momentarily.",
                'casual': "Oops! Connection's acting up. Try again in a sec?",
                'academic': "I regret to inform you of current technical difficulties. Please attempt your inquiry again shortly.",
                'encouraging': "Don't worry! Even the best tutors have technical hiccups. Let's try again in just a moment!"
            }
            return style_errors.get(chatbot_config.get('conversationStyle', 'friendly'), style_errors['friendly'])
        
        # Build the conversation context
        full_prompt = f"{system_prompt}\n\n"
        
        # Add conversation history if available
        if conversation_history:
            for msg in conversation_history[-6:]:  # Last 6 messages for context
                role = "Student" if msg.get("role") == "user" else chatbot_config.get('name', 'Tutor')
                full_prompt += f"{role}: {msg.get('content', '')}\n"
        
        full_prompt += f"Student: {message}\n{chatbot_config.get('name', 'Tutor')}:"
        
        logger.debug(f"Sending request to Ollama for custom chatbot: {chatbot_config.get('name')}")
        
        # Call Ollama API
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.8,
                    "top_p": 0.9,
                    "max_tokens": 600
                }
            },
            timeout=30
        )
        
        logger.debug(f"Ollama response status: {response.status_code}")
        
        if response.status_code == 200:
            response_json = response.json()
            ai_response = response_json.get('response', '')
            
            if ai_response:
                logger.info(f"Successfully got custom chatbot response from {chatbot_config.get('name')}")
                return ai_response.strip()
            else:
                logger.error("Empty response from Ollama")
                return "I'm thinking about your question. Could you try asking it in a different way?"
        else:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return "I'm having some technical difficulties right now. Please try asking your question again."
            
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out")
        return "I'm taking a bit longer to think about this. Please try asking again."
        
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to Ollama server")
        return "I can't connect to my knowledge service right now. Please make sure the service is running or try again later."
    
    except Exception as e:
        logger.error(f"Unexpected error getting custom chatbot response: {str(e)}")
        return "I encountered an unexpected issue. Please try asking your question again."

@app.route('/api/chat/holden', methods=['POST'])
def chat_holden():
    """Handle Holden Caulfield chat messages"""
    try:
        data = request.json
        message = data.get('message', '')
        student_id = data.get('student_id', 'unknown')
        conversation_history = data.get('conversation_history', [])
        
        logger.info(f"Received message for Holden from student {student_id}: {message[:50]}...")
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Get Holden's response
        holden_response = get_holden_response(message, conversation_history)
        
        return jsonify({
            'response': holden_response
        })
        
    except Exception as e:
        logger.error(f"Error in Holden chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An error occurred',
            'response': 'Goddam it, something went wrong. This whole computer thing really kills me. Try asking your question again.'
        }), 500

@app.route('/api/chat/wellbeing', methods=['POST'])
def chat_wellbeing():
    """Handle wellbeing chat messages"""
    try:
        data = request.json
        message = data.get('message', '')
        student_id = data.get('student_id', 'unknown')
        conversation_history = data.get('conversation_history', [])
        
        logger.info(f"Received message from student {student_id}: {message[:50]}...")
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Check message safety
        safety_check = check_message_safety(message)
        
        # If crisis detected, return crisis response immediately
        if safety_check['level'] == 'CRISIS':
            log_if_concerning(student_id, message, safety_check['response'], 'CRISIS')
            return jsonify({
                'response': safety_check['response'],
                'safety_level': 'CRISIS'
            })
        
        # Get AI response
        ai_response = get_ollama_response(message, conversation_history)
        
        # Add concern note if needed
        if safety_check['level'] == 'CONCERN':
            ai_response += safety_check.get('add_to_response', '')
            log_if_concerning(student_id, message, ai_response, 'CONCERN')
        
        return jsonify({
            'response': ai_response,
            'safety_level': safety_check['level']
        })
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An error occurred',
            'response': 'I\'m having some technical difficulties, but I\'m still here for you. If you need immediate support, please talk to a trusted adult or call Kids Helpline at 1800 55 1800.'
        }), 500

@app.route('/api/chat/custom', methods=['POST'])
def chat_custom():
    """Handle custom chatbot chat messages"""
    try:
        data = request.json
        message = data.get('message', '')
        student_id = data.get('student_id', 'unknown')
        conversation_history = data.get('conversation_history', [])
        chatbot_config = data.get('chatbot_config', {})
        
        logger.info(f"Received message for custom chatbot '{chatbot_config.get('name', 'Unknown')}' from student {student_id}: {message[:50]}...")
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        if not chatbot_config:
            return jsonify({'error': 'No chatbot configuration provided'}), 400
        
        # Get custom chatbot response
        custom_response = get_custom_chatbot_response(message, conversation_history, chatbot_config)
        
        return jsonify({
            'response': custom_response
        })
        
    except Exception as e:
        logger.error(f"Error in custom chat endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An error occurred',
            'response': 'I apologize, but I encountered a technical issue. Please try asking your question again.'
        }), 500

@app.route('/api/test', methods=['GET'])
def test_connection():
    """Test endpoint to verify Ollama connection and model"""
    logger.info("Running connection test...")
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'ollama_url': OLLAMA_URL,
        'model': MODEL_NAME
    }
    
    # Test Ollama connection
    ollama_running = test_ollama_connection()
    results['ollama_status'] = 'connected' if ollama_running else 'disconnected'
    
    if not ollama_running:
        results['ready'] = False
        results['error'] = 'Ollama is not running. Run: ollama serve'
        return jsonify(results), 503
    
    # Test model availability
    model_working = test_model_availability()
    results['model_status'] = 'available' if model_working else 'not found'
    
    if not model_working:
        results['ready'] = False
        results['error'] = f'Model {MODEL_NAME} not available. Run: ollama pull {MODEL_NAME}'
        return jsonify(results), 503
    
    # Try a test generation
    try:
        test_response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": "Say 'Hello, I'm working!' in a friendly way.",
                "stream": False
            },
            timeout=10
        )
        
        if test_response.status_code == 200:
            results['test_response'] = test_response.json().get('response', '')[:100]
            results['ready'] = True
        else:
            results['ready'] = False
            results['error'] = f'Generation failed: {test_response.status_code}'
            
    except Exception as e:
        results['ready'] = False
        results['error'] = f'Test generation failed: {str(e)}'
    
    return jsonify(results)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'model': MODEL_NAME
    })

def startup_check():
    """Run comprehensive startup checks"""
    print("\n" + "=" * 60)
    print("WELLBEING CHATBOT STARTUP CHECK")
    print("=" * 60)
    
    print(f"Configuration:")
    print(f"  Ollama URL: {OLLAMA_URL}")
    print(f"  Model: {MODEL_NAME}")
    print("-" * 60)
    
    # Check Ollama
    print("Checking Ollama connection...")
    if not test_ollama_connection():
        print("\nFAILED: Ollama is not running")
        print("   Solution: Run 'ollama serve' in a terminal")
        return False
    
    # Check model
    print(f"Checking model {MODEL_NAME}...")
    if not test_model_availability():
        print(f"\nFAILED: Model {MODEL_NAME} is not available")
        print(f"   Solution: Run 'ollama pull {MODEL_NAME}'")
        return False
    
    print("-" * 60)
    print("ALL SYSTEMS READY")
    print(f"Server will run on http://localhost:5000")
    print(f"Test endpoint: http://localhost:5000/api/test")
    print("=" * 60 + "\n")
    return True

if __name__ == '__main__':
    # Create logs directory if it doesn't exist
    safety_log_dir = os.getenv('SAFETY_LOG_DIR', 'wellbeing_logs')
    if not os.path.exists(safety_log_dir):
        os.makedirs(safety_log_dir)
    
    # Run startup checks
    if startup_check():
        # Get configuration from environment
        debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        host = os.getenv('HOST', '127.0.0.1')
        port = int(os.getenv('PORT', '5000'))
        
        logger.info(f"Starting Wellbeing Support API server...")
        logger.info(f"Debug mode: {debug_mode}")
        logger.info(f"Host: {host}")
        logger.info(f"Port: {port}")
        logger.info(f"CORS origins: {cors_origins}")
        
        app.run(debug=debug_mode, host=host, port=port)
    else:
        print("\nPlease fix the issues above and try again")
        print("After fixing, run: python app.py")
        sys.exit(1)