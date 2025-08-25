# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on port 8080
npm run build      # Build production bundle
npm run build:dev  # Build development bundle  
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend (Flask + Ollama)
```bash
cd backend
pip install -r requirements.txt    # Install Python dependencies
python app.py                      # Start Flask server on port 5000
# Requires Ollama running on http://localhost:11434 with llama3.2:3b model
```

## Architecture

### Technology Stack
- **Frontend Build Tool**: Vite with React SWC plugin
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **UI Components**: shadcn/ui (Radix UI primitives with Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS with custom theme configuration
- **Form Handling**: React Hook Form with Zod validation
- **Backend**: Flask API with Ollama integration for AI chat responses

### Application Overview

**Schoolmate AI** is a friendly learning companion system featuring custom chatbot creation and specialized tutoring interfaces. The app has been rebranded with a robot-companion personality and warm golden accents.

### Core Features

1. **Dashboard** (`/`) - Displays saved custom chatbots alongside built-in tutors
2. **Custom Chatbot System**: 
   - Create/Edit interface (`/create-chatbot`) with full personality customization
   - Persistent localStorage-based storage system (`src/utils/chatbotStorage.ts`)
   - Individual chat routes (`/chat/custom/:botId`) with dynamic theming
3. **Built-in Specialized Chats**:
   - **Wellbeing Chat** (`/chat/wellbeing`) - Mental health support with crisis detection
   - **Holden Caulfield Chat** (`/chat/holden-caulfield`) - Literary character roleplay
   - **Generic Subject Chat** (`/chat/:subjectId`) - Standard tutoring with mock responses

### Custom Chatbot Architecture

- **Storage System**: `src/utils/chatbotStorage.ts` handles CRUD operations for persistent bots
- **Configuration**: Users define name, personality, conversation style, color theme, and reference materials
- **Session Management**: Supports both persistent saved bots and temporary session-based configs
- **Dynamic Theming**: Each custom bot has its own color scheme applied throughout the chat interface

### Backend Integration

- **Flask API** on port 5000 with three main endpoints:
  - `/api/chat/wellbeing` - Crisis detection with safety keyword monitoring
  - `/api/chat/holden` - Character-based responses
  - `/api/chat/custom` - Dynamic system prompt generation from user config
- **Ollama Integration**: Uses llama3.2:3b model for all AI responses
- **Safety Systems**: Crisis detection logs concerning conversations to `wellbeing_logs/`
- **CORS enabled** for frontend communication

### Key Architectural Patterns

- **Path Aliasing**: `@/` maps to `./src/` directory for clean imports
- **Component Library**: All UI components in `src/components/ui/` using shadcn/ui patterns  
- **Route Structure**: Main routes in `src/App.tsx` - custom routes must be ABOVE catch-all "*" route
- **Type Safety**: TypeScript with relaxed strictness (no strict null checks, allows implicit any)
- **Storage Pattern**: localStorage with versioning and migration support for custom chatbots
- **Theme System**: CSS variables with robot-inspired colors (accent-gold, robot-glow) in `src/index.css`

### Design System (Schoolmate AI)

- **Brand Identity**: Friendly robot companion with warm personality
- **Color Palette**: Primary blue + warm golden accents inspired by robot's glowing eyes
- **Visual Assets**: Robot logos in `/public/` (schoolmate-logo.png, favicon.png)
- **Typography**: Friendly, approachable messaging throughout ("learning companion" vs "AI tutor")
- **Theming**: Dynamic color themes per custom chatbot (7 theme options)

### Development Notes

- **Port Management**: Dev server tries 8080, then 8081, 8082, etc. if ports are busy
- **Custom Chatbot Workflow**: Dashboard → Create/Edit → Save → Chat with dynamic routing
- **Route Precedence**: Specific routes (`/chat/wellbeing`, `/chat/custom/:botId`) must come before generic (`/chat/:subjectId`)
- **Storage Migration**: System automatically migrates old sessionStorage configs to new localStorage format
- **Brand Assets**: Logo files copied to `/public/` - schoolmate-logo.png used in headers
- **No test framework** currently configured