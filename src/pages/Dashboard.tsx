import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Heart,
  LogOut,
  User,
  Plus,
  Bot,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { getSavedChatbots, deleteChatbot, migrateFromSessionStorage, SavedChatbot } from '@/utils/chatbotStorage';
import { getStudentDisplayId, clearSessionId } from '@/utils/sessionUtils';

const builtInSubjects = [
  {
    id: 'wellbeing',
    name: 'Wellbeing Support',
    description: 'A safe space to talk about feelings, stress, and get support',
    icon: Heart,
    color: 'text-purple-500'
  },
  {
    id: 'holden-caulfield',
    name: 'Holden Caulfield',
    description: 'Literary analysis help from Holden himself - The Catcher in the Rye',
    icon: BookOpen,
    color: 'text-red-600'
  }
];

const createBotCard = {
  id: 'create-custom',
  name: 'Create New Chatbot',
  description: 'Design your own AI tutor with custom personality and expertise',
  icon: Plus,
  color: 'text-green-600'
};

// Color theme to Tailwind class mapping
const themeColors = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
  orange: 'text-orange-600',
  teal: 'text-teal-600',
  pink: 'text-pink-600'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [savedBots, setSavedBots] = useState<SavedChatbot[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    // Migrate any old sessionStorage data
    migrateFromSessionStorage();
    
    // Load saved chatbots
    loadSavedBots();
  }, []);

  const loadSavedBots = () => {
    const bots = getSavedChatbots();
    setSavedBots(bots);
  };

  const handleStartChat = (subjectId: string) => {
    if (subjectId === 'create-custom') {
      navigate('/create-chatbot');
    } else {
      navigate(`/chat/${subjectId}`);
    }
  };

  const handleStartSavedBotChat = (botId: string) => {
    navigate(`/chat/custom/${botId}`);
  };

  const handleEditBot = (botId: string) => {
    navigate(`/create-chatbot?edit=${botId}`);
  };

  const handleDeleteBot = (botId: string) => {
    if (deleteConfirm === botId) {
      if (deleteChatbot(botId)) {
        loadSavedBots();
        setDeleteConfirm(null);
      } else {
        alert('Failed to delete chatbot. Please try again.');
      }
    } else {
      setDeleteConfirm(botId);
      // Auto-cancel confirmation after 5 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    // Clear session and refresh
    clearSessionId();
    window.location.reload();
  };

  // Combine all cards: built-in subjects + saved bots + create button
  const allCards = [
    ...builtInSubjects,
    ...savedBots.map(bot => ({
      id: bot.id,
      name: bot.name,
      description: bot.personality.length > 100 
        ? bot.personality.substring(0, 100) + '...' 
        : bot.personality,
      icon: Bot,
      color: themeColors[bot.colorTheme],
      type: 'saved-bot' as const,
      bot
    })),
    createBotCard
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-2 border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/schoolmate-text-logo.png" 
                alt="Schoolmate AI" 
                className="w-32 h-32 object-contain"
              />
              <div className="h-6 w-px bg-border"></div>
              <span className="text-muted-foreground">Your Learning Companion</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Session: {getStudentDisplayId()}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Choose Your Learning Adventure
          </h2>
          <p className="text-lg text-muted-foreground">
            Select a tutor below or create your own custom AI learning companion
          </p>
        </div>

        {/* Show info about saved bots */}
        {savedBots.length > 0 && (
          <Alert className="mb-6 max-w-5xl mx-auto">
            <Bot className="h-4 w-4" />
            <AlertDescription>
              You have {savedBots.length} custom chatbot{savedBots.length === 1 ? '' : 's'} saved. 
              You can edit or delete them using the buttons on each card.
            </AlertDescription>
          </Alert>
        )}

        {/* Cards Grid */}
        <div className={`grid gap-8 max-w-7xl mx-auto ${
          allCards.length <= 3 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {allCards.map((card) => {
            const IconComponent = card.icon;
            const isSavedBot = 'type' in card && card.type === 'saved-bot';
            const isCreateButton = card.id === 'create-custom';
            
            return (
              <Card 
                key={card.id}
                className={`group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 bg-card ${
                  deleteConfirm === card.id ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary-subtle rounded-full w-fit">
                    <IconComponent 
                      className={`w-8 h-8 ${card.color}`} 
                    />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {card.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                    {card.description}
                  </p>
                  
                  {/* Management buttons for saved bots */}
                  {isSavedBot && (
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBot(card.id)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBot(card.id)}
                        className={`flex-1 ${
                          deleteConfirm === card.id 
                            ? 'border-red-500 text-red-600 hover:bg-red-50' 
                            : 'hover:border-red-300 hover:text-red-600'
                        }`}
                      >
                        {deleteConfirm === card.id ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Confirm?
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => {
                      if (isSavedBot) {
                        handleStartSavedBotChat(card.id);
                      } else {
                        handleStartChat(card.id);
                      }
                    }}
                    className="w-full font-medium"
                    size="lg"
                  >
                    {isCreateButton ? 'Create New Bot' : 'Start Chat'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state when no custom bots */}
        {savedBots.length === 0 && (
          <div className="text-center mt-12 max-w-md mx-auto">
            <Bot className="w-16 h-16 text-accent-gold mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Custom Learning Companions Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first custom AI tutor by clicking "Create New Bot" above. Your personal learning companions will appear here.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t-2 border-border mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center space-x-6">
            <img 
              src="/favicon.png" 
              alt="Web Logo" 
              className="w-12 h-12 object-contain"
            />
            <img 
              src="/schoolmate-robot-footer.png" 
              alt="Schoolmate Robot" 
              className="w-16 h-16 object-contain"
            />
            <img 
              src="/favicon.png" 
              alt="Web Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Your friendly AI learning companion
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;