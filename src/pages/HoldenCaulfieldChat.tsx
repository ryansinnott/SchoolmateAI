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
  BookOpen,
  Bot,
  User,
  AlertCircle,
  FileText,
  HelpCircle,
  Lightbulb,
  Quote,
  WifiOff,
  CheckCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

const HoldenCaulfieldChat = () => {
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
      content: "Hey there. If you want to know the truth, I'm not really big on this whole tutoring thing - it's pretty phony if you ask me. But I'll tell you what I really thought about stuff in the book, and maybe that'll help you understand it better. Just don't expect me to write your goddam essay for you. That really kills me. So what do you want to know?",
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
      case 'symbolism':
        message = "What does the title 'The Catcher in the Rye' symbolize?";
        break;
      case 'phonies':
        message = "Why do you hate phonies so much?";
        break;
      case 'themes':
        message = "What are the main themes in your story?";
        break;
      case 'character':
        message = "Help me understand your character better";
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
      const response = await fetch('http://localhost:5000/api/chat/holden', {
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
      let errorMessage = "Goddam it, the connection's not working. ";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Backend server is not running on http://localhost:5000');
        errorMessage += "The backend server isn't running. Tell whoever's running this thing to start it up (run 'python app.py' in the backend folder). It really kills me when stuff doesn't work.";
      } else {
        errorMessage += "Something's wrong with the technical stuff. I hate all this phony computer business anyway.";
      }
      
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex">
      {/* Left Sidebar */}
      <div className="w-96 bg-white/90 backdrop-blur border-r-2 border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="w-full justify-start p-0 h-auto mb-4 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Holden Caulfield</h2>
              <p className="text-sm text-gray-600">Literary companion</p>
            </div>
          </div>
        </div>


        {/* Quick Actions */}
        <div className="px-4 py-3 space-y-2">
          <h3 className="font-medium text-sm text-gray-700 mb-2">Essay Help</h3>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('symbolism')}
              className="w-full justify-start border-red-200 hover:bg-red-50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Title Symbolism
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('phonies')}
              className="w-full justify-start border-red-200 hover:bg-red-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Why "Phonies"?
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction('themes')}
              className="w-full justify-start border-red-200 hover:bg-red-50"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Main Themes
            </Button>
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
                <span>Connected to Holden</span>
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

        {/* Essay Help Resources */}
        <div className="p-4 space-y-3">
          <h3 className="font-medium text-sm text-gray-700 mb-2">Essay Help</h3>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => alert('Remember: I\'ll tell you what I thought, but you gotta write your own essay')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Essay Writing Tips
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => alert('Key Themes: Alienation, Growing Up, Phoniness, Innocence, Death')}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Key Themes
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => alert('Important Quotes: "Don\'t ever tell anybody anything..." and more')}
            >
              <Quote className="w-4 h-4 mr-2" />
              Important Quotes
            </Button>
          </div>
        </div>

        {/* About Notice */}
        <div className="mt-auto p-4 bg-gray-50 border-t">
          <p className="text-xs text-gray-600">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Remember: I'm here to help you understand the book, not to write your essay. That'd be phony.
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
                      ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' 
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
                      ? 'bg-white border-gray-200' 
                      : 'bg-gray-50 border-gray-300'
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
                  <div className="p-2 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card className="p-4 bg-white border-gray-200">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t-2 border-gray-200 p-6 bg-white/80 backdrop-blur">
          <form onSubmit={handleSendMessage} className="w-full">
            <div className="flex space-x-4">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me about the book - but don't expect me to do your homework..."
                className="flex-1 h-12 text-base border-gray-300 focus:border-red-400"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="lg"
                disabled={!currentMessage.trim() || isLoading}
                className="px-6 bg-red-600 hover:bg-red-700"
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

export default HoldenCaulfieldChat;