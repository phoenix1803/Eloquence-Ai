# Eloquence-AI: Advanced Interview Preparation Platform

> **The most advanced AI-powered interview preparation platform** featuring real-time voice analysis, intelligent AI interviewers, and a comprehensive Second Brain knowledge system.

## Features Overview

### **Real-Time AI Interview System**
- **Multi-Model AI**: Gemini 2.0 Flash → Gemini 1.5 Pro → Grok fallback system
- **Live Voice Analysis**: Real-time confidence, clarity, pace, and filler word detection
- **Adaptive Questioning**: AI adjusts difficulty and asks curveball questions
- **Natural TTS**: Human-like AI voice responses with optimized delivery
- **Smart Rate Limiting**: Prevents API quota exhaustion with intelligent fallbacks
 
### **Second Brain Knowledge System**
- **RAG-Powered**: Qdrant vector database with semantic search
- **Dual Modes**: 
  - **Companion Mode**: Supportive guidance and mentoring
  - **Mock Mode**: Realistic interview simulation with scoring
- **Code Analysis**: Syntax highlighting with comprehensive technical reviews
- **Memory Persistence**: Saves insights from interview sessions
- **Smart Context**: Builds on conversation history for personalized advice

### **Advanced Analytics & Reporting**
- **Real-Time Feedback**: Live voice metrics during interviews
- **AI-Enhanced PDFs**: Comprehensive reports with professional formatting
- **Performance Tracking**: Multi-dimensional scoring across sessions
- **Voice Coaching**: Specific recommendations based on speech patterns
- **Progress Visualization**: Trends and improvement tracking

### **Professional UI/UX**
- **Full-Screen Interview**: Immersive experience without distractions
- **Glass Morphism**: Modern backdrop-blur effects throughout
- **Responsive Design**: Flawless performance on all devices
- **Real-Time Indicators**: Visual feedback for AI states and voice analysis
- **Smooth Animations**: Framer Motion powered interactions

## Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Docker (optional)

### 1. Clone & Install
```bash
git clone <repository-url>
cd eloquence-ai
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI APIs
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY=your_gemini_key
GROK_API_KEY=your_grok_key

# RAG System
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_key
RAG_SERVICE_URL=http://localhost:8000
```

### 3. Start RAG Service
```bash
cd python_rag_service
pip install -r requirements.txt
python main.py
```

### 4. Launch Application
```bash
npm run dev
```

Visit `http://localhost:3000` 

## Docker Deployment

### Local Development
```bash
docker-compose up --build
```

### Production (Render/Railway/etc.)
```bash
# Build and deploy
docker build -t eloquence-ai .
docker run -p 3000:3000 eloquence-ai
```

## Core Components

### AI Interview System

#### **Multi-Model Architecture**
```typescript
// Smart fallback system
Gemini 2.0 Flash (30 req/min) → Primary for speed
Gemini 1.5 Pro (15 req/min)   → Fallback for complex reasoning  
Grok (unlimited)              → Final fallback for reliability
```

#### **Voice Analysis Pipeline**
```
Microphone Input → Speech Recognition → Voice Analysis → Real-time Feedback
                                    ↓
                            Confidence, Clarity, Pace, 
                            Filler Words, Hesitations
```

#### **Interview Flow**
1. **Setup Phase**: Configure type, difficulty, AI personality
2. **Device Testing**: Verify microphone, camera, audio
3. **Live Interview**: Real-time conversation with voice analysis
4. **AI Processing**: Intelligent question generation with context
5. **Analysis**: Comprehensive performance evaluation
6. **Reporting**: AI-enhanced PDF with actionable insights

### Second Brain System

#### **RAG Architecture**
```
User Query → Embedding Generation → Vector Search → Context Retrieval → LLM Response
```

#### **Interaction Modes**

**Companion Mode** 
- Supportive guidance and mentoring
- Encourages learning and growth
- Asks follow-up questions for deeper thinking
- Warm, friendly tone

**Mock Mode** 
- Realistic interview simulation
- Evaluates responses with scores (1-10)
- Provides constructive feedback
- Asks progressive difficulty questions

#### **Knowledge Management**
- **Automatic Indexing**: Interview sessions saved as searchable content
- **Smart Categorization**: By performance, type, and insights
- **Contextual Search**: Semantic similarity matching
- **Memory Building**: Grows more valuable with each session

### Analytics & Reporting

#### **Real-Time Voice Metrics**
- **Confidence**: Based on volume, pace, hesitations
- **Clarity**: Frequency analysis for speech intelligibility  
- **Pace**: Words per minute with optimal range detection
- **Filler Words**: Real-time "um", "uh", "like" counting
- **Hesitations**: Pause and repetition detection

#### **AI-Enhanced PDF Reports**
- **Executive Summary**: Performance overview with predictions
- **Detailed Breakdown**: Skill-by-skill analysis with visual indicators
- **Voice Patterns**: Complete speech analysis with trends
- **AI Insights**: Contextual analysis of conversation patterns
- **Action Plans**: Specific, measurable improvement steps
- **Professional Formatting**: Visual charts and progress bars

## Technical Architecture

### **Frontend Stack**
- **Next.js 14**: App Router with server components
- **TypeScript**: Full type safety throughout
- **Tailwind CSS**: Utility-first styling with custom components
- **Framer Motion**: Smooth animations and transitions
- **React Context**: State management for user sessions

### **Backend Services**
- **Next.js API Routes**: RESTful endpoints for AI and data
- **Python FastAPI**: RAG service with vector operations
- **Qdrant**: Vector database for semantic search
- **Clerk**: Authentication and user management

### **AI Integration**
- **Google Gemini**: Primary AI for interviews and analysis
- **Grok**: Reliable fallback for Second Brain queries
- **Rate Limiting**: Smart request management across models
- **Context Management**: Conversation history and user preferences

### **Voice Processing**
- **Web Speech API**: Real-time speech recognition
- **Audio Analysis**: Frequency domain processing for clarity
- **Pattern Detection**: ML-based filler word and hesitation detection
- **Speech Synthesis**: Optimized TTS for natural AI responses

## UI/UX Design Philosophy

### **Design Principles**
- **Minimalism**: Clean, distraction-free interfaces
- **Accessibility**: WCAG compliant with keyboard navigation
- **Responsiveness**: Mobile-first design approach
- **Performance**: Optimized animations and loading states

### **Visual Language**
- **Color Palette**: Black/white base with accent colors for modes
- **Typography**: Inter font family for readability
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable design system with variants

### **Interaction Patterns**
- **Progressive Disclosure**: Information revealed as needed
- **Immediate Feedback**: Real-time visual responses
- **Contextual Help**: Tooltips and guidance where helpful
- **Error Prevention**: Validation and confirmation patterns

## Security & Privacy

### **Data Protection**
- **Local Processing**: Voice analysis happens in browser
- **Encrypted APIs**: All communication uses HTTPS/TLS
- **User Control**: Explicit consent for data saving
- **Session Isolation**: Each interview is independent

### **Authentication**
- **Clerk Integration**: Industry-standard auth provider
- **JWT Tokens**: Secure session management
- **Route Protection**: Middleware-based access control
- **User Permissions**: Granular access to features

## Performance Optimizations

### **Frontend Performance**
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js automatic optimization
- **Caching**: Strategic use of React Query and SWR
- **Bundle Analysis**: Regular size monitoring and optimization

### **Backend Performance**
- **Rate Limiting**: Prevents API abuse and quota exhaustion
- **Caching**: Redis for frequently accessed data
- **Database Optimization**: Indexed queries and connection pooling
- **CDN**: Static asset delivery optimization

### **AI Performance**
- **Model Selection**: Right model for each use case
- **Prompt Optimization**: Efficient token usage
- **Response Streaming**: Real-time delivery where possible
- **Fallback Systems**: Graceful degradation on failures

## Testing Strategy

### **Unit Testing**
```bash
npm run test        # Jest unit tests
npm run test:watch  # Watch mode for development
```

### **Integration Testing**
```bash
npm run test:e2e    # Playwright end-to-end tests
```

### **Performance Testing**
```bash
npm run lighthouse  # Performance auditing
npm run bundle-analyzer  # Bundle size analysis
```

## Deployment Guide

### **Environment Setup**
1. **Development**: Local with hot reload
2. **Staging**: Docker containers with test data
3. **Production**: Optimized builds with monitoring

### **Platform-Specific Guides**

#### **Render Deployment**
```bash
# Build command
npm run build

# Start command  
npm start

# Environment variables
# Set all .env.local variables in Render dashboard
```

#### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Railway Deployment**
```bash
# Connect GitHub repo
# Set environment variables
# Deploy automatically on push
```

### **Docker Production**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS base
# ... (see Dockerfile for complete setup)
```

##  Monitoring & Analytics

### **Application Monitoring**
- **Error Tracking**: Sentry integration for error monitoring
- **Performance**: Web Vitals and custom metrics
- **User Analytics**: Privacy-focused usage tracking
- **API Monitoring**: Response times and error rates

### **Business Metrics**
- **User Engagement**: Session duration and feature usage
- **Interview Completion**: Success rates and drop-off points
- **Voice Analysis**: Accuracy and improvement trends
- **Second Brain Usage**: Query patterns and satisfaction

## API Reference

### **Interview Endpoints**
```typescript
POST /api/interview/ai
// Generate next interview question
{
  conversationHistory: string
  config: InterviewConfig
  voiceAnalysis?: VoiceAnalysis
}

POST /api/interview/activity  
// Log interview session
{
  type: string
  duration: number
  score: number
}

POST /api/interview/report
// Generate PDF report
{
  summary: InterviewSummary
  conversation: Message[]
  voiceAnalyses: VoiceAnalysis[]
}
```

### **Second Brain Endpoints**
```typescript
POST /api/second-brain
// Chat with Second Brain
{
  message: string
  mode: 'companion' | 'mock'
  conversationHistory: Message[]
}

POST /api/rag/save-interview
// Save interview to knowledge base
{
  conversation: Message[]
  summary: InterviewSummary
  voiceAnalyses: VoiceAnalysis[]
}
```

### **RAG Service Endpoints**
```python
POST /search
# Semantic search
{
  "query": "string",
  "limit": 5,
  "threshold": 0.7
}

POST /add
# Add document
{
  "content": "string",
  "metadata": {
    "type": "string",
    "tags": ["string"]
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
