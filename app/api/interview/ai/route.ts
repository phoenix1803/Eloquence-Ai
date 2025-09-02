import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { aiService } from '../../../../lib/services/aiService'

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversationHistory, config, voiceAnalysis, userResponse, questionCount } = await request.json()

        // Build the interview prompt
        const prompt = buildInterviewPrompt(conversationHistory, config, voiceAnalysis, userResponse, questionCount)

        // Use the AI service with rate limiting and fallbacks
        const response = await aiService.generateInterviewQuestion(conversationHistory, config, voiceAnalysis)

        return NextResponse.json({ response })
    } catch (error: any) {
        console.error('Interview AI error:', error)

        // Return a fallback response
        const fallbackResponses = [
            "Can you tell me about yourself and your background?",
            "What interests you most about this role?",
            "Describe a challenging situation you faced and how you handled it.",
            "What are your greatest strengths?",
            "Where do you see yourself in 5 years?",
            "Why should we hire you?",
            "Do you have any questions for me?"
        ]

        const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

        return NextResponse.json({
            response: fallbackResponse,
            fallback: true
        })
    }
}

function buildInterviewPrompt(
    conversationHistory: string,
    config: any,
    voiceAnalysis: any,
    userResponse: string,
    questionCount: number
): string {
    return `You are an expert AI interviewer conducting a ${config.type} interview.

INTERVIEW SETTINGS:
- Type: ${config.type} (${config.type === 'hr' ? 'behavioral and general questions' : config.type === 'technical' ? 'technical and problem-solving questions' : 'custom topic questions'})
- Difficulty: ${config.difficulty}
- Tolerance: ${config.tolerance} (${config.tolerance === 'strict' ? 'be demanding and probe deeper' : 'be supportive and encouraging'})
- Personality: ${config.calmness} (${config.calmness === 'professional' ? 'maintain formal tone' : 'be warm and friendly'})
- Question Speed: ${config.speed}

CONVERSATION SO FAR:
${conversationHistory}

${voiceAnalysis ? `
CANDIDATE'S VOICE ANALYSIS:
- Confidence Level: ${voiceAnalysis.confidence}%
- Speech Clarity: ${voiceAnalysis.clarity}%
- Speaking Pace: ${voiceAnalysis.pace}%
- Filler Words: ${voiceAnalysis.fillerWords}
- Hesitations: ${voiceAnalysis.hesitations}

${voiceAnalysis.confidence < 60 ? 'NOTE: Candidate seems nervous - consider being more encouraging.' : ''}
${voiceAnalysis.clarity < 70 ? 'NOTE: Speech clarity could be better - may need clarification.' : ''}
` : ''}

INTERVIEW PROGRESS: Question ${questionCount + 1}/8

INSTRUCTIONS:
${questionCount === 0 ? '- Start with a warm greeting and ask for self-introduction' : ''}
${questionCount > 0 && questionCount < 3 ? '- Ask foundational questions about background and experience' : ''}
${questionCount >= 3 && questionCount < 6 ? '- Ask more challenging questions, include curveball questions' : ''}
${questionCount >= 6 ? '- Ask final challenging questions and wrap up' : ''}

- Keep your response under 40 words
- Ask only ONE question at a time
- Be ${config.tolerance === 'strict' ? 'challenging and critical' : 'supportive and encouraging'}
- Use ${config.calmness === 'professional' ? 'formal, business language' : 'warm, conversational tone'}
- If this is question 8, conclude the interview professionally

Generate your next interview question:`
}