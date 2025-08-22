import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Calculator, 
  Microscope, 
  Clock, 
  Globe, 
  Languages, 
  MonitorSpeaker, 
  GraduationCap,
  LogOut,
  User
} from 'lucide-react';

const subjects = [
  {
    id: 'english',
    name: 'English',
    description: 'Literature, grammar, writing, and reading comprehension',
    icon: BookOpen,
    color: 'text-blue-600'
  },
  {
    id: 'mathematics', 
    name: 'Mathematics',
    description: 'Algebra, geometry, calculus, and problem solving',
    icon: Calculator,
    color: 'text-green-600'
  },
  {
    id: 'science',
    name: 'Science', 
    description: 'Biology, chemistry, physics, and scientific method',
    icon: Microscope,
    color: 'text-purple-600'
  },
  {
    id: 'history',
    name: 'History',
    description: 'World events, civilizations, and historical analysis',
    icon: Clock,
    color: 'text-amber-600'
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Physical and human geography, maps, and cultures',
    icon: Globe,
    color: 'text-teal-600'
  },
  {
    id: 'languages',
    name: 'Languages',
    description: 'Foreign languages, vocabulary, and communication',
    icon: Languages,
    color: 'text-rose-600'
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Programming, algorithms, and technology concepts',
    icon: MonitorSpeaker,
    color: 'text-indigo-600'
  },
  {
    id: 'study-skills',
    name: 'Study Skills',
    description: 'Time management, note-taking, and exam preparation',
    icon: GraduationCap,
    color: 'text-orange-600'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleStartChat = (subjectId: string) => {
    navigate(`/chat/${subjectId}`);
  };

  const handleLogout = () => {
    // Since there's no login page, just refresh the dashboard
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-2 border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">AI Tutoring System</h1>
              <div className="h-6 w-px bg-border"></div>
              <span className="text-muted-foreground">Student Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Student ID: 12345</span>
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
            Choose Your Subject
          </h2>
          <p className="text-lg text-muted-foreground">
            Select a subject below to start your AI-powered learning session
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-4 gap-6">
          {subjects.map((subject) => {
            const IconComponent = subject.icon;
            
            return (
              <Card 
                key={subject.id}
                className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 bg-card"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary-subtle rounded-full w-fit">
                    <IconComponent 
                      className={`w-8 h-8 ${subject.color}`} 
                    />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {subject.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {subject.description}
                  </p>
                  
                  <Button 
                    onClick={() => handleStartChat(subject.id)}
                    className="w-full font-medium"
                    size="lg"
                  >
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;