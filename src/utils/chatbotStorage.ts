export interface SavedChatbot {
  id: string;
  name: string;
  personality: string;
  referenceMaterials?: string;
  conversationStyle: 'friendly' | 'professional' | 'casual' | 'academic' | 'encouraging';
  colorTheme: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'pink';
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotStorageData {
  version: string;
  bots: Record<string, SavedChatbot>;
}

const STORAGE_KEY = 'savedChatbots';
const STORAGE_VERSION = '1.0';
const SESSION_TEMP_KEY = 'customChatbot'; // For temporary/immediate use

/**
 * Generate a unique ID for a chatbot
 */
export function generateChatbotId(): string {
  return `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved chatbots from localStorage
 */
export function getSavedChatbots(): SavedChatbot[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed: ChatbotStorageData = JSON.parse(data);
    
    // Validate version and structure
    if (parsed.version !== STORAGE_VERSION || !parsed.bots) {
      console.warn('Invalid chatbot storage format, resetting...');
      return [];
    }

    return Object.values(parsed.bots);
  } catch (error) {
    console.error('Error loading saved chatbots:', error);
    return [];
  }
}

/**
 * Get a specific chatbot by ID
 */
export function getChatbotById(id: string): SavedChatbot | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed: ChatbotStorageData = JSON.parse(data);
    return parsed.bots?.[id] || null;
  } catch (error) {
    console.error('Error loading chatbot by ID:', error);
    return null;
  }
}

/**
 * Save a chatbot to localStorage
 */
export function saveChatbot(chatbot: Omit<SavedChatbot, 'id' | 'createdAt' | 'updatedAt'>, id?: string): string {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    let storageData: ChatbotStorageData;

    if (data) {
      storageData = JSON.parse(data);
      // Ensure proper structure
      if (!storageData.bots) {
        storageData.bots = {};
      }
    } else {
      storageData = {
        version: STORAGE_VERSION,
        bots: {}
      };
    }

    const chatbotId = id || generateChatbotId();
    const now = new Date().toISOString();
    const existingBot = storageData.bots[chatbotId];

    const savedBot: SavedChatbot = {
      ...chatbot,
      id: chatbotId,
      createdAt: existingBot?.createdAt || now,
      updatedAt: now
    };

    storageData.bots[chatbotId] = savedBot;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

    return chatbotId;
  } catch (error) {
    console.error('Error saving chatbot:', error);
    throw new Error('Failed to save chatbot');
  }
}

/**
 * Delete a chatbot from localStorage
 */
export function deleteChatbot(id: string): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;

    const storageData: ChatbotStorageData = JSON.parse(data);
    if (!storageData.bots || !storageData.bots[id]) {
      return false;
    }

    delete storageData.bots[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    return false;
  }
}

/**
 * Update an existing chatbot
 */
export function updateChatbot(id: string, updates: Partial<Omit<SavedChatbot, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
  try {
    const existing = getChatbotById(id);
    if (!existing) return false;

    const updated = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    saveChatbot(updated, id);
    return true;
  } catch (error) {
    console.error('Error updating chatbot:', error);
    return false;
  }
}

/**
 * Check if a chatbot name is unique (excluding a specific ID for updates)
 */
export function isChatbotNameUnique(name: string, excludeId?: string): boolean {
  const bots = getSavedChatbots();
  return !bots.some(bot => bot.name.toLowerCase() === name.toLowerCase() && bot.id !== excludeId);
}

/**
 * Migrate from old sessionStorage format to new localStorage format
 */
export function migrateFromSessionStorage(): void {
  try {
    const oldData = sessionStorage.getItem(SESSION_TEMP_KEY);
    if (oldData) {
      const parsed = JSON.parse(oldData);
      
      // Only migrate if it looks like a complete chatbot config
      if (parsed.name && parsed.personality) {
        const migratedBot: Omit<SavedChatbot, 'id' | 'createdAt' | 'updatedAt'> = {
          name: parsed.name,
          personality: parsed.personality,
          referenceMaterials: parsed.referenceMaterials || '',
          conversationStyle: parsed.conversationStyle || 'friendly',
          colorTheme: parsed.colorTheme || 'blue'
        };

        saveChatbot(migratedBot);
        sessionStorage.removeItem(SESSION_TEMP_KEY);
        console.log('Migrated chatbot from sessionStorage to localStorage');
      }
    }
  } catch (error) {
    console.error('Error migrating from sessionStorage:', error);
  }
}

/**
 * Set temporary chatbot config for immediate use (maintains backward compatibility)
 */
export function setTempChatbot(config: SavedChatbot): void {
  try {
    sessionStorage.setItem(SESSION_TEMP_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error setting temporary chatbot:', error);
  }
}

/**
 * Get temporary chatbot config (maintains backward compatibility)
 */
export function getTempChatbot(): SavedChatbot | null {
  try {
    const data = sessionStorage.getItem(SESSION_TEMP_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting temporary chatbot:', error);
    return null;
  }
}

/**
 * Clear temporary chatbot config
 */
export function clearTempChatbot(): void {
  sessionStorage.removeItem(SESSION_TEMP_KEY);
}

/**
 * Get storage statistics
 */
export function getStorageStats() {
  const bots = getSavedChatbots();
  return {
    totalBots: bots.length,
    storageSize: localStorage.getItem(STORAGE_KEY)?.length || 0,
    oldestBot: bots.length > 0 ? Math.min(...bots.map(b => new Date(b.createdAt).getTime())) : null,
    newestBot: bots.length > 0 ? Math.max(...bots.map(b => new Date(b.createdAt).getTime())) : null
  };
}