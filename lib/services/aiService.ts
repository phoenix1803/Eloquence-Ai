import { GoogleGenerativeAI } from '@google/generative-ai'

// Rate limiting for different models
class RateLimiter {
    private requests: { [key: string]: number[] } = {}

    canMakeRequest(model: string, maxPerMinute: number): boolean {
        const now = Date.now()
        const currentMinute = Math.floor(now / 60000)

        if (!this.requests[model]) {
            this.requests[model] = []
        }

        // Clean old requests (older than current minute)
        this.requests[model] = this.requests[model].filter(time => time >= currentMinute)

        if (this.requests[model].length >= maxPerMinute) {
            console.log(`Rate limit reached for ${model}: ${this.requests[model].length}/${maxPerMinute}`)
            return false
        }

        this.requests[model].push(currentMinute)
        return true
    }

    // Reset rate limits (useful for testing)
    reset() {
        this.requests = {}
    }
}

const rateLimiter = new RateLimiter()

// Initialize AI models
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class AIService {
    private static instance: AIService

    static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService()
        }
        return AIService.instance
    }

    async generateResponse(
        prompt: string,
        context: any = {},
        preferredModel: 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'grok' = 'gemini-2.0-flash'
    ): Promise<string> {

        // Try Gemini 2.0 Flash first (higher rate limit)
        if (preferredModel === 'gemini-2.0-flash' && rateLimiter.canMakeRequest('gemini-2.0-flash', 28)) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
                const result = await model.generateContent(prompt)
                return result.response.text()
            } catch (error: any) {
                console.warn('Gemini 2.0 Flash failed:', error.message)
            }
        }

        // Fallback to Gemini 1.5 Pro (lower rate limit)
        if (rateLimiter.canMakeRequest('gemini-1.5-flash', 14)) {
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
                const result = await model.generateContent(prompt)
                return result.response.text()
            } catch (error: any) {
                console.warn('Gemini Failed:', error.message)
            }
        }

        // Final fallback to Grok
        try {
            return await this.callGrokAPI(prompt, context)
        } catch (error) {
            console.error('All AI services failed:', error)
            throw new Error('AI services temporarily unavailable. Please try again in a moment.')
        }
    }

    private async callGrokAPI(prompt: string, context: any): Promise<string> {
        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant specializing in interview preparation and communication skills.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: 'grok-beta',
                    stream: false,
                    temperature: 0.7,
                    max_tokens: 500
                })
            })

            if (!response.ok) {
                throw new Error(`Grok API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            return data.choices[0]?.message?.content || 'I apologize, but I cannot generate a response right now.'
        } catch (error) {
            console.error('Grok API error:', error)
            throw error
        }
    }

    // Specialized method for interview questions (uses Gemini 2.0 Flash for speed)
    async generateInterviewQuestion(
        conversationHistory: string,
        config: any,
        voiceAnalysis?: any
    ): Promise<string> {
        const prompt = this.buildInterviewPrompt(conversationHistory, config, voiceAnalysis)
        return this.generateResponse(prompt, { type: 'interview' }, 'gemini-2.0-flash')
    }

    // Specialized method for second brain queries (uses Grok for reliability)
    async generateSecondBrainResponse(
        query: string,
        ragResults: any[],
        conversationHistory: string[],
        mode: 'chat' | 'companion' | 'mock' = 'chat'
    ): Promise<string> {
        const prompt = this.buildSecondBrainPrompt(query, ragResults, conversationHistory, mode)
        return this.generateResponse(prompt, { type: 'secondbrain' }, 'grok')
    }

    private buildInterviewPrompt(conversationHistory: string, config: any, voiceAnalysis?: any): string {
        return `You are an expert AI interviewer conducting a ${config.type} interview.

CONFIGURATION:
- Type: ${config.type}
- Difficulty: ${config.difficulty}
- Tolerance: ${config.tolerance}
- Personality: ${config.calmness}
- Speed: ${config.speed}

CONVERSATION HISTORY:
${conversationHistory}

${voiceAnalysis ? `
VOICE ANALYSIS:
- Confidence: ${voiceAnalysis.confidence}%
- Clarity: ${voiceAnalysis.clarity}%
- Pace: ${voiceAnalysis.pace}%
- Filler Words: ${voiceAnalysis.fillerWords}
` : ''}

Generate the next interview question. Keep it under 40 words. Be ${config.tolerance === 'strict' ? 'challenging' : 'supportive'} and ${config.calmness === 'professional' ? 'formal' : 'friendly'}.`
    }

    private buildSecondBrainPrompt(
        query: string,
        ragResults: any[],
        conversationHistory: string[],
        mode: 'chat' | 'companion' | 'mock' = 'chat'
    ): string {
        const ragContext = ragResults.length > 0
            ? `RELEVANT KNOWLEDGE FROM YOUR MEMORY:\n${ragResults.map(r => r.content).join('\n\n')}`
            : 'No specific knowledge found in memory for this query.'

        const modeInstructions = {
            chat: 'Provide direct, informative answers to help with interview preparation.',
            companion: 'Be supportive, encouraging, and provide guidance like a mentor. Ask follow-up questions to help the user think deeper.',
            mock: 'Act as an interviewer. Ask challenging questions, evaluate responses, and provide constructive feedback with scores.'
        }

        return `You are Eloquence-AI's Second Brain in ${mode.toUpperCase()} mode.

MODE: ${mode.toUpperCase()}
INSTRUCTIONS: ${modeInstructions[mode]}

${ragContext}

CONVERSATION HISTORY:
${conversationHistory.slice(-5).join('\n')}

USER QUERY: ${query}

${mode === 'mock' ? 'If this is a response to your question, evaluate it and provide a score (1-10) with detailed feedback. Then ask the next question.' : ''}

Provide a helpful response based on your mode and available knowledge.`
    }

    // Reset rate limiter (useful for development)
    resetRateLimits() {
        rateLimiter.reset()
    }
}

export const aiService = AIService.getInstance()