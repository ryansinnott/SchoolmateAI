import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Send, 
  BookOpen, 
  Calculator, 
  Microscope, 
  Clock, 
  Globe, 
  Languages, 
  MonitorSpeaker, 
  GraduationCap,
  Bot,
  User
} from 'lucide-react';

const subjects = {
  'english': { name: 'English', icon: BookOpen, color: 'text-blue-600' },
  'mathematics': { name: 'Mathematics', icon: Calculator, color: 'text-green-600' },
  'science': { name: 'Science', icon: Microscope, color: 'text-purple-600' },
  'history': { name: 'History', icon: Clock, color: 'text-amber-600' },
  'geography': { name: 'Geography', icon: Globe, color: 'text-teal-600' },
  'languages': { name: 'Languages', icon: Languages, color: 'text-rose-600' },
  'computer-science': { name: 'Computer Science', icon: MonitorSpeaker, color: 'text-indigo-600' },
  'study-skills': { name: 'Study Skills', icon: GraduationCap, color: 'text-orange-600' }
};

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const subject = subjects[subjectId as keyof typeof subjects];
  const IconComponent = subject?.icon || BookOpen;

  useEffect(() => {
    // Add welcome message
    if (subject) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: `Hello! I'm your AI tutor for ${subject.name}. I'm here to help you learn and understand concepts, solve problems, and answer any questions you have. What would you like to work on today?`,
        timestamp: new Date()
      }]);
    }
  }, [subject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I understand you're asking about "${currentMessage}". This is a great question! Let me help you understand this concept step by step. In ${subject?.name}, this topic relates to several key principles that we can explore together. Would you like me to explain the fundamentals first, or do you have a specific aspect you'd like to focus on?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Subject Not Found</h1>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-card border-r-2 border-border flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="w-full justify-start p-0 h-auto mb-4 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-subtle rounded-lg">
              <IconComponent className={`w-6 h-6 ${subject.color}`} />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">{subject.name}</h2>
              <p className="text-sm text-muted-foreground">AI Tutor</p>
            </div>
          </div>
        </div>

        {/* Subject List */}
        <div className="flex-1 p-4">
          <h3 className="font-medium text-foreground mb-3">Other Subjects</h3>
          <div className="space-y-2">
            {Object.entries(subjects).map(([id, subj]) => {
              const SubjIcon = subj.icon;
              return (
                <Button
                  key={id}
                  variant={id === subjectId ? "secondary" : "ghost"}
                  className="w-full justify-start h-12"
                  onClick={() => navigate(`/chat/${id}`)}
                >
                  <SubjIcon className={`w-4 h-4 mr-3 ${subj.color}`} />
                  {subj.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="bg-card border-b-2 border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-subtle rounded-lg">
                <IconComponent className={`w-5 h-5 ${subject.color}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {subject.name} Tutoring Session
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ask questions, get explanations, and learn together
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    message.type === 'ai' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-chat-user text-primary'
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
                      ? 'bg-chat-ai border-chat-border' 
                      : 'bg-chat-user border-chat-border'
                  }`}>
                    <p className="text-foreground leading-relaxed">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
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
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </div>
                  <Card className="p-4 bg-chat-ai border-chat-border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t-2 border-border p-6 bg-card">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={`Ask your ${subject.name} question here...`}
                className="flex-1 h-12 text-base"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="lg"
                disabled={!currentMessage.trim() || isLoading}
                className="px-6"
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

export default Chat;