import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Bot, 
  FileText, 
  Upload, 
  Palette,
  MessageCircle,
  Save,
  Play,
  RefreshCw
} from 'lucide-react';
import { getChatbotById, saveChatbot, updateChatbot, isChatbotNameUnique, SavedChatbot, setTempChatbot } from '@/utils/chatbotStorage';

const formSchema = z.object({
  name: z.string().min(1, 'Chatbot name is required').max(50, 'Name must be 50 characters or less'),
  personality: z.string().min(10, 'Personality description must be at least 10 characters').max(1000, 'Personality description must be 1000 characters or less'),
  referenceMaterials: z.string().max(5000, 'Reference materials must be 5000 characters or less').optional(),
  conversationStyle: z.enum(['friendly', 'professional', 'casual', 'academic', 'encouraging']),
  colorTheme: z.enum(['blue', 'green', 'purple', 'red', 'orange', 'teal', 'pink'])
});

type FormData = z.infer<typeof formSchema>;

const conversationStyles = [
  { value: 'friendly', label: 'Friendly & Supportive', description: 'Warm, encouraging, and helpful' },
  { value: 'professional', label: 'Professional', description: 'Clear, direct, and informative' },
  { value: 'casual', label: 'Casual & Relaxed', description: 'Easy-going and conversational' },
  { value: 'academic', label: 'Academic', description: 'Scholarly and detailed explanations' },
  { value: 'encouraging', label: 'Motivational', description: 'Inspiring and confidence-building' }
];

const colorThemes = [
  { value: 'blue', label: 'Ocean Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Forest Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Royal Purple', class: 'bg-purple-500' },
  { value: 'red', label: 'Crimson Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Sunset Orange', class: 'bg-orange-500' },
  { value: 'teal', label: 'Teal Ocean', class: 'bg-teal-500' },
  { value: 'pink', label: 'Rose Pink', class: 'bg-pink-500' }
];

const CreateChatbot = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conversationStyle: 'friendly',
      colorTheme: 'blue',
      referenceMaterials: ''
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const existingBot = getChatbotById(editId);
      if (existingBot) {
        setIsEditMode(true);
        setEditingBotId(editId);
        
        // Populate form with existing data
        reset({
          name: existingBot.name,
          personality: existingBot.personality,
          referenceMaterials: existingBot.referenceMaterials || '',
          conversationStyle: existingBot.conversationStyle,
          colorTheme: existingBot.colorTheme
        });
      } else {
        // Bot not found, redirect to dashboard
        alert('Chatbot not found. Redirecting to dashboard.');
        navigate('/');
        return;
      }
    }
    setLoading(false);
  }, [searchParams, navigate, reset]);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setValue('referenceMaterials', text.substring(0, 5000)); // Limit to 5000 chars
      };
      reader.readAsText(file);
    }
  };

  const validateUniqueName = (name: string): boolean => {
    if (!isChatbotNameUnique(name, editingBotId || undefined)) {
      alert(`A chatbot named "${name}" already exists. Please choose a different name.`);
      return false;
    }
    return true;
  };

  const handleSaveAndLaunch = (data: FormData) => {
    if (!validateUniqueName(data.name)) return;

    try {
      if (isEditMode && editingBotId) {
        // Update existing bot
        updateChatbot(editingBotId, data);
        
        // Set as temp chatbot for immediate use
        const updatedBot = getChatbotById(editingBotId);
        if (updatedBot) {
          setTempChatbot(updatedBot);
          navigate(`/chat/custom/${editingBotId}`);
        }
      } else {
        // Create new bot
        const botId = saveChatbot(data);
        
        // Set as temp chatbot for immediate use
        const savedBot = getChatbotById(botId);
        if (savedBot) {
          setTempChatbot(savedBot);
          navigate(`/chat/custom/${botId}`);
        }
      }
    } catch (error) {
      alert('Failed to save chatbot. Please try again.');
      console.error('Save error:', error);
    }
  };

  const handleSaveOnly = (data: FormData) => {
    if (!validateUniqueName(data.name)) return;

    try {
      if (isEditMode && editingBotId) {
        // Update existing bot
        updateChatbot(editingBotId, data);
        alert('Chatbot updated successfully!');
      } else {
        // Create new bot
        saveChatbot(data);
        alert('Chatbot saved successfully!');
      }
      
      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      alert('Failed to save chatbot. Please try again.');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-2 border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <div className="flex items-center space-x-3">
              <img 
                src="/schoolmate-logo.png" 
                alt="Schoolmate AI" 
                className="w-6 h-6 object-contain"
              />
              <div className="p-2 bg-accent-gold-subtle rounded-lg">
                <Bot className="w-5 h-5 text-accent-gold" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {isEditMode ? 'Edit Learning Companion' : 'Create Learning Companion'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {isEditMode ? 'Update Your Learning Companion' : 'Design Your Learning Companion'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEditMode 
              ? 'Modify your personalized AI companion settings and teaching style'
              : 'Create a friendly AI tutor with custom personality and expertise, just like your robot friend Schoolmate!'
            }
          </p>
          {isEditMode && (
            <Alert className="mt-4">
              <RefreshCw className="h-4 w-4" />
              <AlertDescription>
                You are editing an existing chatbot. Changes will be saved to your original bot.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading chatbot data...</span>
          </div>
        ) : (

        <form className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Chatbot Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Math Tutor Max, Science Sally, History Helper..."
                  className="text-base"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personality">Personality & Expertise *</Label>
                <Textarea
                  id="personality"
                  {...register('personality')}
                  placeholder="Describe your chatbot's personality, teaching style, and areas of expertise. For example: 'A patient and encouraging math tutor who specializes in algebra and geometry. Uses real-world examples and breaks down complex problems into simple steps. Always positive and celebrates student progress.'"
                  className="min-h-[120px] text-base"
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{errors.personality?.message || 'Describe how your chatbot should behave and what it knows'}</span>
                  <span>{watchedValues.personality?.length || 0}/1000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reference Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Reference Materials (Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  variant={!isFileUpload ? "default" : "outline"}
                  onClick={() => setIsFileUpload(false)}
                  className="flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Text</span>
                </Button>
                <Button
                  type="button"
                  variant={isFileUpload ? "default" : "outline"}
                  onClick={() => setIsFileUpload(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </Button>
              </div>

              {!isFileUpload ? (
                <div className="space-y-2">
                  <Textarea
                    {...register('referenceMaterials')}
                    placeholder="Paste any reference materials, notes, or specific information you want your chatbot to know about. This could include course materials, specific facts, or teaching guidelines."
                    className="min-h-[150px] text-base"
                  />
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Add specific knowledge or teaching materials for your chatbot</span>
                    <span>{watchedValues.referenceMaterials?.length || 0}/5000</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary">Click to upload a file</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports .txt, .md, .doc files up to 5000 characters
                    </p>
                  </div>
                  {watchedValues.referenceMaterials && (
                    <div className="space-y-2">
                      <Label>Uploaded Content:</Label>
                      <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto text-sm">
                        {watchedValues.referenceMaterials}
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        {watchedValues.referenceMaterials.length}/5000 characters
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style & Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Style & Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Conversation Style *</Label>
                <Select onValueChange={(value) => setValue('conversationStyle', value as FormData['conversationStyle'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose conversation style" />
                  </SelectTrigger>
                  <SelectContent>
                    {conversationStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-sm text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Theme *</Label>
                <div className="grid grid-cols-4 gap-3">
                  {colorThemes.map((theme) => (
                    <div
                      key={theme.value}
                      onClick={() => setValue('colorTheme', theme.value as FormData['colorTheme'])}
                      className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        watchedValues.colorTheme === theme.value 
                          ? 'border-primary bg-primary-subtle' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-md ${theme.class} mb-2`}></div>
                      <div className="text-sm font-medium text-center">{theme.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {watchedValues.name && watchedValues.personality && (
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <strong>Preview:</strong> Your chatbot "{watchedValues.name}" will have a{' '}
                {conversationStyles.find(s => s.value === watchedValues.conversationStyle)?.label.toLowerCase()} style
                with a {colorThemes.find(t => t.value === watchedValues.colorTheme)?.label.toLowerCase()} theme.
                {watchedValues.referenceMaterials && ' It will use your uploaded reference materials to provide specialized knowledge.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              onClick={handleSubmit(handleSaveAndLaunch)}
              className="flex items-center space-x-2 flex-1"
              size="lg"
            >
              <Play className="w-4 h-4" />
              <span>{isEditMode ? 'Update & Launch' : 'Save & Launch Chatbot'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(handleSaveOnly)}
              className="flex items-center space-x-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              <span>{isEditMode ? 'Update' : 'Save Only'}</span>
            </Button>
          </div>
        </form>
        )}
      </main>
    </div>
  );
};

export default CreateChatbot;