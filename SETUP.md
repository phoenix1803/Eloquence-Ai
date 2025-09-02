# Eloquence-AI Complete Setup Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up API Keys

#### Get Gemini API Key (Free)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Get Hugging Face API Key (Free)
1. Visit [Hugging Face](https://huggingface.co/settings/tokens)
2. Create access token
3. Add to `.env.local`:
```env
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

#### Set Up Qdrant (Free Tier)
1. Visit [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create free cluster
3. Get cluster URL and API key
4. Add to `.env.local`:
```env
QDRANT_URL=https://your-cluster-url.qdrant.tech:6333
QDRANT_API_KEY=your_qdrant_api_key_here
```

### 3. Start RAG Service
```bash
cd python_rag_service
pip install -r requirements.txt
python main.py
```

### 4. Start Next.js App
```bash
npm run dev
```

## Features Overview

### AI Interview System
- **Real-time AI Interviewer** with Gemini 2.0 Flash
- **Voice Analysis** (confidence, clarity, pace, filler words)
- **Adaptive Questioning** with curveballs and follow-ups
- **Multiple AI Models** with automatic fallbacks
- **Rate Limiting** to stay within free tiers

### Second Brain
- **RAG-powered Knowledge Base** with Qdrant vector search
- **Chat & Companion Modes** for different interaction styles
- **Code Analysis** with syntax highlighting
- **Interview Memory** saves and recalls past sessions
- **Smart Search** finds relevant knowledge instantly

### Advanced Analytics
- **Voice Pattern Analysis** with real-time feedback
- **Performance Tracking** across multiple sessions
- **Comprehensive Reports** with actionable insights
- **Progress Visualization** showing improvement trends

## Technical Architecture

### AI Model Strategy
```
Primary: Gemini 2.0 Flash (30 req/min) → Fast responses
Fallback: Gemini 1.5 Pro (15 req/min) → Complex reasoning  
Fallback: Qwen via HuggingFace → Unlimited free tier
```

### RAG Pipeline
```
User Query → Embedding → Vector Search → Context + LLM → Response
```

### Voice Analysis Pipeline
```
Microphone → Speech Recognition → Voice Analysis → Real-time Feedback
```

## Voice Features

### Real-time Analysis
- **Confidence Detection**: Volume, pace, hesitations
- **Clarity Assessment**: Frequency analysis
- **Filler Word Counting**: "um", "uh", "like" detection
- **Hesitation Tracking**: Pauses and repetitions

### Text-to-Speech
- **Natural AI Voice** with optimized settings
- **Sentence-by-sentence** delivery for natural flow
- **Low latency** optimized for conversation

## Second Brain Capabilities

### Knowledge Management
- **Automatic Indexing** of interview sessions
- **Smart Categorization** by type and performance
- **Contextual Search** finds relevant insights
- **Memory Persistence** across sessions

### Interaction Modes
- **Chat Mode**: Direct Q&A for specific questions
- **Companion Mode**: Supportive, encouraging guidance
- **Code Review**: Technical analysis with suggestions

### RAG Features
- **Semantic Search** with 384-dimensional embeddings
- **Relevance Scoring** with configurable thresholds
- **Automatic Tagging** for better organization
- **Recent Memory** for quick access

## Privacy & Performance

### Data Handling
- **Local Voice Processing** - no audio sent to servers
- **Encrypted API Calls** - all communication secured
- **User-controlled RAG** - save only what you choose
- **Session Isolation** - each interview is independent

### Performance Optimizations
- **Rate Limiting** prevents API quota exhaustion
- **Smart Caching** reduces redundant calls
- **Efficient Embeddings** with lightweight models
- **Progressive Loading** for smooth UX

## Advanced Setup (Optional)

### Custom Qdrant Setup
```bash
# Local Qdrant (if preferred over cloud)
docker run -p 6333:6333 qdrant/qdrant
```

### Production Deployment
```bash
# Build for production
npm run build
npm start

# Deploy RAG service
cd python_rag_service
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Environment Variables (Complete)
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI APIs
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_hf_token

# RAG System
QDRANT_URL=https://your-cluster.qdrant.tech:6333
QDRANT_API_KEY=your_qdrant_key
RAG_SERVICE_URL=http://localhost:8000
```

## Usage Guide

### Interview Practice
1. **Setup**: Choose type, difficulty, AI personality
2. **Device Test**: Verify microphone and camera
3. **Live Session**: Speak naturally, get real-time feedback
4. **Analysis**: Review comprehensive performance report
5. **Memory**: Optionally save insights to Second Brain

### Second Brain
1. **Ask Questions**: Natural language queries about interviews
2. **Code Review**: Paste code for technical analysis
3. **Knowledge Search**: Find insights from past sessions
4. **Companion Mode**: Get supportive guidance and tips

### Analytics
1. **Performance Tracking**: Monitor improvement over time
2. **Voice Analysis**: Understand speaking patterns
3. **Detailed Reports**: Download comprehensive PDFs
4. **Progress Visualization**: See trends and improvements

### Technical Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Gemini 2.0 Flash, Gemini 1.5 Pro, Qwen
- **RAG**: Qdrant vector database, sentence-transformers
- **Voice**: Web Speech API, Speech Synthesis API
- **Backend**: Python FastAPI, Node.js API routes
- **Auth**: Clerk authentication
- **Deployment**: Vercel-ready, Docker support

