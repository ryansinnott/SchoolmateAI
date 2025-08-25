import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Send, 
  Bot,
  User,
  Settings,
  WifiOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getChatbotById, getTempChatbot, clearTempChatbot } from '@/utils/chatbotStorage';
import { getSessionId } from '@/utils/sessionUtils';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatbotConfig {
  name: string;
  personality: string;
  referenceMaterials?: string;
  conversationStyle: 'friendly' | 'professional' | 'casual' | 'academic' | 'encouraging';
  colorTheme: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'pink';
}

// Theme configurations
const themeConfigs = {
  blue: {
    gradient: 'from-blue-50 to-indigo-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-blue-100',
    iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    iconColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    buttonOutline: 'border-blue-200 hover:bg-blue-50',
    aiAvatar: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    aiCard: 'bg-white border-blue-100',
    userCard: 'bg-blue-50 border-blue-200',
    loadingDots: 'bg-blue-400'
  },
  green: {
    gradient: 'from-green-50 to-emerald-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-green-100',
    iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
    iconColor: 'text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    buttonOutline: 'border-green-200 hover:bg-green-50',
    aiAvatar: 'bg-gradient-to-br from-green-500 to-emerald-500',
    aiCard: 'bg-white border-green-100',
    userCard: 'bg-green-50 border-green-200',
    loadingDots: 'bg-green-400'
  },
  purple: {
    gradient: 'from-purple-50 to-violet-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-purple-100',
    iconBg: 'bg-gradient-to-br from-purple-100 to-violet-100',
    iconColor: 'text-purple-600',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    buttonOutline: 'border-purple-200 hover:bg-purple-50',
    aiAvatar: 'bg-gradient-to-br from-purple-500 to-violet-500',
    aiCard: 'bg-white border-purple-100',
    userCard: 'bg-purple-50 border-purple-200',
    loadingDots: 'bg-purple-400'
  },
  red: {
    gradient: 'from-red-50 to-rose-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-red-100',
    iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
    iconColor: 'text-red-600',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    buttonOutline: 'border-red-200 hover:bg-red-50',
    aiAvatar: 'bg-gradient-to-br from-red-500 to-rose-500',
    aiCard: 'bg-white border-red-100',
    userCard: 'bg-red-50 border-red-200',
    loadingDots: 'bg-red-400'
  },
  orange: {
    gradient: 'from-orange-50 to-amber-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-orange-100',
    iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100',
    iconColor: 'text-orange-600',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    buttonOutline: 'border-orange-200 hover:bg-orange-50',
    aiAvatar: 'bg-gradient-to-br from-orange-500 to-amber-500',
    aiCard: 'bg-white border-orange-100',
    userCard: 'bg-orange-50 border-orange-200',
    loadingDots: 'bg-orange-400'
  },
  teal: {
    gradient: 'from-teal-50 to-cyan-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-teal-100',
    iconBg: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    iconColor: 'text-teal-600',
    buttonColor: 'bg-teal-600 hover:bg-teal-700',
    buttonOutline: 'border-teal-200 hover:bg-teal-50',
    aiAvatar: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    aiCard: 'bg-white border-teal-100',
    userCard: 'bg-teal-50 border-teal-200',
    loadingDots: 'bg-teal-400'
  },
  pink: {
    gradient: 'from-pink-50 to-rose-50',
    sidebarBg: 'bg-white/90',
    borderColor: 'border-pink-100',
    iconBg: 'bg-gradient-to-br from-pink-100 to-rose-100',
    iconColor: 'text-pink-600',
    buttonColor: 'bg-pink-600 hover:bg-pink-700',
    buttonOutline: 'border-pink-200 hover:bg-pink-50',
    aiAvatar: 'bg-gradient-to-br from-pink-500 to-rose-500',
    aiCard: 'bg-white border-pink-100',
    userCard: 'bg-pink-50 border-pink-200',
    loadingDots: 'bg-pink-400'
  }
};

const CustomChat = () => {
  const navigate = useNavigate();
  const { botId } = useParams<{ botId?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let config: ChatbotConfig | null = null;

    if (botId) {
      // Load from localStorage by bot ID
      const savedBot = getChatbotById(botId);
      if (savedBot) {
        config = savedBot;
      } else {
        // Bot not found, redirect to dashboard
        alert('Chatbot not found. Redirecting to dashboard.');
        navigate('/');
        return;
      }
    } else {
      // Backward compatibility: try sessionStorage for immediate temp usage
      const tempConfig = getTempChatbot();
      if (tempConfig) {
        config = tempConfig;
        // Clear temp config after loading to avoid confusion
        clearTempChatbot();
      } else {
        // No configuration found, redirect to create chatbot
        navigate('/create-chatbot');
        return;
      }
    }

    if (config) {
      setChatbotConfig(config);
      
      // Add welcome message based on personality and style
      const styleGreetings = {
        friendly: `Hi there! I'm ${config.name}, and I'm so excited to help you learn! 😊`,
        professional: `Hello. I'm ${config.name}, your AI tutor. I'm here to provide educational support.`,
        casual: `Hey! I'm ${config.name}. What's up? Ready to dive into some learning?`,
        academic: `Greetings. I am ${config.name}, your scholarly assistant. I look forward to our intellectual discourse.`,
        encouraging: `Hello, amazing learner! I'm ${config.name}, and I believe in your potential! Let's achieve great things together!`
      };

      setMessages([{
        id: '1',
        type: 'ai',
        content: `${styleGreetings[config.conversationStyle]} ${config.personality.split('.')[0]}. What would you like to explore today?`,
        timestamp: new Date()
      }]);
    }

    setLoading(false);
    
    // Test backend connection on mount
    testConnection();
  }, [botId, navigate]);

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
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isLoading || !chatbotConfig) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          student_id: getSessionId(),
          chatbot_config: chatbotConfig,
          conversation_history: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Backend error');
      }
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      
      // Fallback response based on conversation style
      const styleResponses = {
        friendly: "I'm having trouble connecting to my backend service right now, but I'd love to help you! Could you try asking your question again in a moment?",
        professional: "I'm experiencing technical difficulties with my connection. Please retry your request momentarily.",
        casual: "Oops! Looks like I'm having some connection issues. Give me a sec and try again?",
        academic: "I regret to inform you that I am currently experiencing connectivity issues with my knowledge base. Please attempt your inquiry again shortly.",
        encouraging: "Don't worry! Even though I'm having some technical hiccups right now, we'll get through this together. Try asking again in just a moment!"
      };

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: chatbotConfig ? styleResponses[chatbotConfig.conversationStyle] : "I'm having connection issues. Please try again.",
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

  const handleEditChatbot = () => {
    if (botId) {
      navigate(`/create-chatbot?edit=${botId}`);
    } else {
      navigate('/create-chatbot');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !chatbotConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {loading ? 'Waking up your learning companion...' : 'Learning companion not found'}
          </h1>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const theme = themeConfigs[chatbotConfig.colorTheme];

  return (
    <div className={`h-screen bg-gradient-to-br ${theme.gradient} flex`}>
      {/* Left Sidebar */}
      <div className={`w-96 ${theme.sidebarBg} backdrop-blur border-r-2 ${theme.borderColor} flex flex-col`}>
        {/* Sidebar Header */}
        <div className={`p-6 border-b ${theme.borderColor}`}>
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="w-full justify-start p-0 h-auto mb-4 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className={`p-3 ${theme.iconBg} rounded-lg`}>
              <Bot className={`w-6 h-6 ${theme.iconColor}`} />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{chatbotConfig.name}</h2>
              <p className="text-sm text-gray-600">Your learning companion</p>
            </div>
          </div>
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
                <span>Connected to AI service</span>
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

        {/* Chatbot Info */}
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-sm text-gray-700 mb-2">About This Chatbot</h3>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="mb-2"><strong>Style:</strong> {chatbotConfig.conversationStyle}</p>
            <p className="leading-relaxed">{chatbotConfig.personality.substring(0, 150)}...</p>
          </div>

          {chatbotConfig.referenceMaterials && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              📚 Using custom reference materials
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleEditChatbot}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Chatbot Settings
          </Button>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-3">
          <Alert className={`bg-${chatbotConfig.colorTheme}-50 border-${chatbotConfig.colorTheme}-200`}>
            <Bot className={`h-4 w-4 ${theme.iconColor}`} />
            <AlertDescription className={`text-${chatbotConfig.colorTheme}-900 text-sm`}>
              You're chatting with your learning companion "{chatbotConfig.name}". 
              This friendly AI tutor has been personalized just for you!
            </AlertDescription>
          </Alert>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Info Notice */}
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-xs text-gray-600">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            This is your custom AI tutor. Settings are saved for this session only.
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
                <div className={`flex space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    message.type === 'ai' 
                      ? `${theme.aiAvatar} text-white` 
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
                      ? theme.aiCard 
                      : theme.userCard
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
                  <div className={`p-2 rounded-full ${theme.aiAvatar} text-white`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card className={`p-4 ${theme.aiCard}`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 ${theme.loadingDots} rounded-full animate-bounce`}></div>
                      <div className={`w-2 h-2 ${theme.loadingDots} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
                      <div className={`w-2 h-2 ${theme.loadingDots} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className={`border-t-2 ${theme.borderColor} p-6 bg-white/80 backdrop-blur`}>
          <form onSubmit={handleSendMessage} className="w-full">
            <div className="flex space-x-4">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={`Ask ${chatbotConfig.name} anything...`}
                className={`flex-1 h-12 text-base border-gray-300 focus:border-${chatbotConfig.colorTheme}-400`}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="lg"
                disabled={!currentMessage.trim() || isLoading}
                className={`px-6 ${theme.buttonColor}`}
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

export default CustomChat;