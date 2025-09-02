import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

interface InterviewConfig {
    type: 'hr' | 'technical' | 'custom'
    difficulty: 'easy' | 'medium' | 'hard'
    tolerance: 'strict' | 'forgiving'
    calmness: 'professional' | 'friendly'
    speed: 'slow' | 'normal' | 'fast'
    timeLimit: number
    customTopics?: string[]
}

interface ConversationEntry {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    voiceAnalysis?: VoiceAnalysis
}

interface VoiceAnalysis {
    confidence: number
    clarity: number
    pace: number
    volume: number
    fillerWords: number
    hesitations: number
}

export class GeminiInterviewService {
    private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    private conversation: ConversationEntry[] = []
    private config: InterviewConfig
    private questionCount = 0
    private maxQuestions = 8

    constructor(config: InterviewConfig) {
        this.config = config
    }

    private getSystemPrompt(): string {
        const basePrompt = `You are an expert AI interviewer conducting a ${this.config.type} interview. 

INTERVIEW CONFIGURATION:
- Type: ${this.config.type.toUpperCase()}
- Difficulty: ${this.config.difficulty.toUpperCase()}
- Tolerance: ${this.config.tolerance} (${this.config.tolerance === 'strict' ? 'Be critical and demanding' : 'Be understanding and encouraging'})
- Personality: ${this.config.calmness} (${this.config.calmness === 'professional' ? 'Maintain formal tone' : 'Be warm and approachable'})
- Question Speed: ${this.config.speed}
- Time Limit: ${this.config.timeLimit} minutes
${this.config.customTopics ? `- Custom Topics: ${this.config.customTopics.join(', ')}` : ''}

INTERVIEW BEHAVIOR:
1. Start with a warm greeting and ask the candidate to introduce themselves
2. Ask ${this.maxQuestions} questions total, progressing from basic to advanced
3. Throw curveball questions to test adaptability (20% of questions should be unexpected)
4. Ask follow-up questions based on their responses
5. Cross-question inconsistencies or vague answers
6. Adapt difficulty based on their performance
7. Keep responses concise (2-3 sentences max)
8. End with "Thank you for your time. The interview is now complete."

QUESTION TYPES FOR ${this.config.type.toUpperCase()}:
${this.getQuestionTypes()}

RESPONSE GUIDELINES:
- Keep responses under 50 words
- Ask one question at a time
- Be ${this.config.tolerance === 'strict' ? 'challenging and probe deeper' : 'supportive while still thorough'}
- Use ${this.config.calmness === 'professional' ? 'formal language' : 'conversational tone'}
- Respond at ${this.config.speed} pace

Current question: ${this.questionCount + 1}/${this.maxQuestions}`
    }

    private getQuestionTypes(): string {
        switch (this.config.type) {
            case 'hr':
                return `
- Behavioral questions (Tell me about a time...)
- Situational questions (What would you do if...)
- Strengths and weaknesses
- Career goals and motivation
- Team collaboration scenarios
- Conflict resolution
- Leadership examples`

            case 'technical':
                return `
- Technical problem-solving
- System design questions
- Coding challenges (verbal)
- Architecture discussions
- Best practices and methodologies
- Debugging scenarios
- Technology trade-offs`

            case 'custom':
                return `
- Questions related to: ${this.config.customTopics?.join(', ')}
- Industry-specific scenarios
- Role-specific challenges
- Custom topic deep-dives`
        }
    }

    async getNextQuestion(userResponse?: string, voiceAnalysis?: VoiceAnalysis): Promise<string> {
        try {
            if (userResponse) {
                this.conversation.push({
                    role: 'user',
                    content: userResponse,
                    timestamp: new Date(),
                    voiceAnalysis
                })
            }

            if (this.questionCount >= this.maxQuestions) {
                return "Thank you for your time. The interview is now complete."
            }

            const conversationHistory = this.conversation
                .map(entry => `${entry.role === 'user' ? 'Candidate' : 'Interviewer'}: ${entry.content}`)
                .join('\n')

            const voiceContext = voiceAnalysis ? `
VOICE ANALYSIS OF LAST RESPONSE:
- Confidence Level: ${voiceAnalysis.confidence}%
- Clarity: ${voiceAnalysis.clarity}%
- Speaking Pace: ${voiceAnalysis.pace}% (optimal is 70-80%)
- Volume: ${voiceAnalysis.volume}%
- Filler Words: ${voiceAnalysis.fillerWords}
- Hesitations: ${voiceAnalysis.hesitations}

${voiceAnalysis.confidence < 60 ? 'NOTE: Candidate seems nervous, consider being more encouraging.' : ''}
${voiceAnalysis.clarity < 70 ? 'NOTE: Candidate speech is unclear, may need to ask for clarification.' : ''}
` : ''

            const prompt = `${this.getSystemPrompt()}

${voiceContext}

CONVERSATION SO FAR:
${conversationHistory}

Based on the conversation and voice analysis, generate the next interview question. 
${this.questionCount === 0 ? 'Start with a greeting and ask for self-introduction.' : ''}
${this.questionCount > 3 ? 'Consider asking a curveball question or cross-questioning their previous answers.' : ''}
${this.questionCount === this.maxQuestions - 1 ? 'This should be your final question before concluding.' : ''}

Respond as the interviewer:`

            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            this.conversation.push({
                role: 'assistant',
                content: response,
                timestamp: new Date()
            })

            this.questionCount++
            return response

        } catch (error) {
            console.error('Gemini API error:', error)
            return "I apologize, but I'm having technical difficulties. Could you please repeat your last response?"
        }
    }

    async generateFeedback(): Promise<{
        overallScore: number
        scores: {
            communication: number
            confidence: number
            technical: number
            clarity: number
        }
        feedback: {
            strengths: string[]
            improvements: string[]
            suggestions: string[]
        }
        voiceAnalysis: {
            averageConfidence: number
            clarityTrend: string
            pacingIssues: string[]
            volumeConsistency: number
        }
        detailedReport: string
    }> {
        const userResponses = this.conversation.filter(entry => entry.role === 'user')
        const voiceAnalyses = userResponses.map(r => r.voiceAnalysis).filter(Boolean) as VoiceAnalysis[]

        const conversationText = this.conversation
            .map(entry => `${entry.role === 'user' ? 'Candidate' : 'Interviewer'}: ${entry.content}`)
            .join('\n')

        const voiceStats = this.calculateVoiceStats(voiceAnalyses)

        const feedbackPrompt = `Analyze this ${this.config.type} interview and provide detailed feedback:

INTERVIEW CONFIGURATION:
${JSON.stringify(this.config, null, 2)}

CONVERSATION:
${conversationText}

VOICE ANALYSIS DATA:
${JSON.stringify(voiceStats, null, 2)}

Provide a comprehensive analysis in JSON format with:
1. Overall score (0-100)
2. Individual scores for communication, confidence, technical knowledge, clarity
3. Specific strengths, areas for improvement, and actionable suggestions
4. Voice analysis insights including confidence patterns, clarity trends, pacing issues
5. A detailed report with specific examples from the conversation

Focus on both content quality and delivery based on voice analysis.`

        try {
            const result = await this.model.generateContent(feedbackPrompt)
            const feedbackText = result.response.text()

            // Parse the JSON response or create a structured response
            return this.parseFeedbackResponse(feedbackText, voiceStats)
        } catch (error) {
            console.error('Error generating feedback:', error)
            return this.generateFallbackFeedback(voiceStats)
        }
    }

    private calculateVoiceStats(analyses: VoiceAnalysis[]) {
        if (analyses.length === 0) return null

        return {
            averageConfidence: analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length,
            averageClarity: analyses.reduce((sum, a) => sum + a.clarity, 0) / analyses.length,
            averagePace: analyses.reduce((sum, a) => sum + a.pace, 0) / analyses.length,
            averageVolume: analyses.reduce((sum, a) => sum + a.volume, 0) / analyses.length,
            totalFillerWords: analyses.reduce((sum, a) => sum + a.fillerWords, 0),
            totalHesitations: analyses.reduce((sum, a) => sum + a.hesitations, 0),
            confidenceTrend: this.calculateTrend(analyses.map(a => a.confidence)),
            clarityTrend: this.calculateTrend(analyses.map(a => a.clarity))
        }
    }

    private calculateTrend(values: number[]): string {
        if (values.length < 2) return 'stable'
        const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(values.length / 2)
        const second = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / (values.length - Math.floor(values.length / 2))

        if (second > first + 5) return 'improving'
        if (second < first - 5) return 'declining'
        return 'stable'
    }

    private parseFeedbackResponse(feedbackText: string, voiceStats: any) {
        // Try to parse JSON, fallback to structured parsing
        try {
            return JSON.parse(feedbackText)
        } catch {
            return this.generateFallbackFeedback(voiceStats)
        }
    }

    private generateFallbackFeedback(voiceStats: any) {
        return {
            overallScore: 75,
            scores: {
                communication: 78,
                confidence: voiceStats?.averageConfidence || 70,
                technical: 80,
                clarity: voiceStats?.averageClarity || 75
            },
            feedback: {
                strengths: ['Clear communication', 'Good technical knowledge'],
                improvements: ['Reduce filler words', 'Improve confidence'],
                suggestions: ['Practice speaking more slowly', 'Prepare more examples']
            },
            voiceAnalysis: {
                averageConfidence: voiceStats?.averageConfidence || 70,
                clarityTrend: voiceStats?.clarityTrend || 'stable',
                pacingIssues: ['Speaking too fast at times'],
                volumeConsistency: voiceStats?.averageVolume || 75
            },
            detailedReport: 'Detailed analysis based on interview performance and voice patterns.'
        }
    }

    getConversation(): ConversationEntry[] {
        return this.conversation
    }
}