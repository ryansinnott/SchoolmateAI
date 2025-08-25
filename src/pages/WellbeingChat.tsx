import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSessionId } from '@/utils/sessionUtils';
import { 
  ArrowLeft, 
  Send, 
  Heart,
  Bot,
  User,
  AlertCircle,
  Phone,
  Wind,
  Brain,
  Users,
  BookOpen,
  WifiOff,
  CheckCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

const WellbeingChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hi! I'm here to listen and support you. How are you feeling today? Remember, this is a safe space to talk about anything that's on your mind.",
      timestamp: new Date()
    }]);
    
    // Test backend connection on mount
    testConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/test', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ready) {
          setConnectionStatus('connected');
          console.log('✅ Backend connected successfully:', data);
        } else {
          setConnectionStatus('disconnected');
          console.error('⚠️ Backend not ready:', data.error);
        }
      } else {
        setConnectionStatus('disconnected');
        console.error('❌ Backend returned error status:', response.status);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('❌ Cannot connect to backend at http://localhost:5000');
      console.error('Make sure to run: python app.py in the backend folder');
      console.error('Error details:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    let message = '';
    switch (action) {
      case 'breathing':
        message = "I'd like to try a breathing exercise";
        break;
      case 'anxiety':
        message = "I'm feeling anxious";
        break;
      case 'study_stress':
        message = "I'm stressed about my studies";
        break;
      case 'friendship':
        message = "I'm having problems with my friends";
        break;
    }
    
    if (message) {
      setCurrentMessage(message);
      await handleSendMessage(null, message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent | null, overrideMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = overrideMessage || currentMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/wellbeing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          student_id: getSessionId(),
          conversation_history: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Log the actual error for debugging
      console.error('Failed to connect to backend:', error);
      
      // Determine the type of error and provide appropriate message
      let errorMessage = "I understand you're reaching out. ";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Backend server is not running on http://localhost:5000');
        errorMessage += "The support service isn't running. Please make sure the backend server is started (run 'python app.py' in the backend folder).";
      } else {
        errorMessage += "While I'm having some technical issues connecting right now, please know that your feelings are valid.";
      }
      
      errorMessage += " If you need immediate support, please talk to a trusted adult, school counselor, or call Kids Helpline at 1800 55 1800.";
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex">
      {/* Left Sidebar */}
      <div className="w-96 bg-white/90 backdrop-blur border-r-2 border-purple-100 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-purple-100">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="w-full justify-start p-0 h-auto mb-4 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Wellbeing Support</h2>
              <p className="text-sm text-gray-600">Your caring companion</p>
            </div>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="px-4 py-3">
          <Alert className="bg-purple-100 border-purple-300">
            <Heart className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900 text-sm">
              Remember: I'm here to support you, but please talk to a trusted adult or counselor for serious concerns. 
              In emergencies, call 000.
            </AlertDescription>
          </Alert>
        </div>


        {/* Connection Status */}
        <div className="px-4 pt-2">
          <div className={`flex items-center space-x-2 text-sm ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'disconnected' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Connected to support service</span>
              </>
            ) : connectionStatus === 'disconnected' ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Service offline</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Checking connection...</span>
              </>
            )}
          </div>
          {connectionStatus === 'disconnected' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={testConnection}
            >
              Retry Connection
            </Button>
          )}
        </div>

        {/* Crisis Resources */}
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-sm text-gray-700 mb-2">Need immediate help?</h3>
          
          <Button
            variant="outline"
            className="w-full justify-start border-red-200 hover:bg-red-50"
            onClick={() => window.open('tel:1800551800')}
          >
            <Phone className="w-4 h-4 mr-2 text-red-500" />
            Kids Helpline: 1800 55 1800
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start border-orange-200 hover:bg-orange-50"
            onClick={() => window.open('tel:131114')}
          >
            <Phone className="w-4 h-4 mr-2 text-orange-500" />
            Lifeline: 13 11 14
          </Button>
          
          <div className="pt-4 border-t">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => alert('Connecting to school counselor...')}
            >
              Talk to School Counselor
            </Button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-auto p-4 bg-purple-50 border-t">
          <p className="text-xs text-gray-600">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            This conversation is private and stays on school servers. For serious concerns, please talk to a trusted adult.
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">


        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="w-full space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    message.type === 'ai' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                      : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                  }`}>
                    {message.type === 'ai' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <Card className={`p-4 ${
                    message.type === 'ai' 
                      ? 'bg-white border-purple-100' 
                      : 'bg-purple-50 border-purple-200'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </Card>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-2xl">
                  <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card className="p-4 bg-white border-purple-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t-2 border-purple-100 p-6 bg-white/80 backdrop-blur">
          <form onSubmit={handleSendMessage} className="w-full">
            <div className="flex space-x-4">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Share what's on your mind... I'm here to listen"
                className="flex-1 h-12 text-base border-purple-200 focus:border-purple-400"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="lg"
                disabled={!currentMessage.trim() || isLoading}
                className="px-6 bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WellbeingChat;