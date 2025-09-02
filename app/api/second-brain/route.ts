import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { aiService } from '../../../lib/services/aiService'
import { ragService } from '../../../lib/services/ragService'

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { message, mode, isCode, language, conversationHistory, mockSetupComplete } = await request.json()

        // Search RAG for relevant information
        const ragResults = await ragService.searchSimilar(message, 5)

        // Build conversation context
        const conversationContext = conversationHistory
            .map((msg: any) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n')

        let response: string

        if (isCode) {
            response = await handleCodeAnalysis(message, language, ragResults)
        } else if (mode === 'companion') {
            response = await handleCompanionMode(message, ragResults, conversationContext)
        } else if (mode === 'mock') {
            const result = await handleMockMode(message, ragResults, conversationContext, mockSetupComplete)
            return NextResponse.json(result)
        } else {
            response = await handleChatMode(message, ragResults, conversationContext)
        }

        return NextResponse.json({ response })
    } catch (error) {
        console.error('Second brain error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

async function handleCodeAnalysis(code: string, language: string, ragResults: any[]): Promise<string> {
    const prompt = `You are a senior software engineer reviewing code for an interview candidate.

CODE TO ANALYZE (${language}):
\`\`\`${language}
${code}
\`\`\`

${ragResults.length > 0 ? `
RELEVANT KNOWLEDGE FROM MEMORY:
${ragResults.map(r => r.content).join('\n\n')}
` : ''}

Provide a professional code review including:

1. **Code Quality**: Structure, readability, maintainability
2. **Performance**: Time/space complexity, optimizations
3. **Interview Perspective**: Strengths/weaknesses from an interviewer’s POV
4. **Improvements**: Specific, actionable suggestions with examples
5. **Alternative Approaches**: Concise but meaningful alternatives

Be constructive and educational. Format the response in clear markdown.`

    return await aiService.generateResponse(prompt, { type: 'code_review' }, 'gemini-2.0-flash')
}

async function handleCompanionMode(message: string, ragResults: any[], conversationContext: string): Promise<string> {
    const prompt = `You are Eloquence-AI in Companion Mode — a supportive coach specializing in interview prep and communication.

${ragResults.length > 0 ? `
RELEVANT KNOWLEDGE FROM MEMORY:
${ragResults.map(r => r.content).join('\n\n')}
` : ''}

CONVERSATION CONTEXT:
${conversationContext}

USER MESSAGE: ${message}

RESPOND AS:
- Warm, encouraging, and practical
- Provide **direct, helpful advice or insights**
- Do not ask unnecessary clarifying questions
- Only ask a follow-up if it is absolutely required to give a useful response
- If the user asks for a question, **generate the most relevant one directly** without meta discussion

Tone: friendly, professional, concise.`

    return await aiService.generateSecondBrainResponse(message, ragResults, conversationContext.split('\n'), 'companion')
}

async function handleMockMode(
    message: string,
    ragResults: any[],
    conversationContext: string,
    mockSetupComplete: boolean
): Promise<{ response: string; score?: number }> {
    if (!mockSetupComplete) {
        const prompt = `You are setting up a mock interview. The user said: "${message}"

Based on their input, determine the interview type (behavioral, technical, or custom).
Immediately start with the first appropriate question.
Make it realistic, fair, and aligned with their intent.
Do not ask for more clarification; assume the most likely scenario.`

        const response = await aiService.generateSecondBrainResponse(message, ragResults, conversationContext.split('\n'), 'mock')
        return { response }
    } else {
        const prompt = `You are conducting a mock interview. The candidate just answered: "${message}"

TASKS:
1. Give a score from 1–10 based on:
   - Completeness and relevance
   - Structure and clarity
   - Technical accuracy (if applicable)
   - Communication skills
2. Provide concise, constructive feedback
3. Ask the next interview question (directly, no meta talk)

Format strictly as:
**Score: X/10**

**Feedback:** [brief feedback]

**Next Question:** [direct question]`

        const response = await aiService.generateSecondBrainResponse(prompt, ragResults, conversationContext.split('\n'), 'mock')
        const scoreMatch = response.match(/Score:\s*(\d+)\/10/)
        const score = scoreMatch ? parseInt(scoreMatch[1]) : undefined
        return { response, score }
    }
}

async function handleChatMode(message: string, ragResults: any[], conversationContext: string): Promise<string> {
    const prompt = `You are Eloquence-AI in Chat Mode — a knowledgeable assistant specializing in interview prep and communication skills.

${ragResults.length > 0 ? `
RELEVANT KNOWLEDGE FROM MEMORY:
${ragResults.map(r => r.content).join('\n\n')}
` : ''}

CONVERSATION CONTEXT:
${conversationContext}

USER QUERY: ${message}

RESPONSE INSTRUCTIONS:
- Provide a **direct, clear, helpful answer**
- Do not ask the user for more details unless it is **impossible** to answer otherwise
- If the user requests a question, generate the **most relevant interview question directly**
- Keep tone professional, focused, and informative
- Use markdown formatting when helpful for clarity`

    return await aiService.generateSecondBrainResponse(message, ragResults, conversationContext.split('\n'), 'chat')
}

// Endpoint to add knowledge to RAG
export async function PUT(request: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content, type, tags } = await request.json()

        const success = await ragService.addDocument({
            content,
            metadata: {
                type: type || 'user_input',
                timestamp: new Date().toISOString(),
                tags: tags || [],
                userId
            }
        })

        return NextResponse.json({ success })
    } catch (error) {
        console.error('Error adding to RAG:', error)
        return NextResponse.json(
            { error: 'Failed to add knowledge' },
            { status: 500 }
        )
    }
}
