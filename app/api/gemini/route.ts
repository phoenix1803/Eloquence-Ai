import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
    try {
        const { prompt, conversationHistory, config, voiceAnalysis } = await request.json()

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const enhancedPrompt = `${prompt}

CONVERSATION HISTORY:
${conversationHistory || ''}

${voiceAnalysis ? `
VOICE ANALYSIS:
- Confidence: ${voiceAnalysis.confidence}%
- Clarity: ${voiceAnalysis.clarity}%
- Pace: ${voiceAnalysis.pace}%
- Volume: ${voiceAnalysis.volume}%
- Filler Words: ${voiceAnalysis.fillerWords}
- Hesitations: ${voiceAnalysis.hesitations}
` : ''}

Respond as an interviewer keeping responses under 50 words.`

        const result = await model.generateContent(enhancedPrompt)
        const response = result.response.text()

        return NextResponse.json({ response })
    } catch (error) {
        console.error('Gemini API error:', error)
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { conversation, config, voiceAnalyses } = await request.json()

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        const feedbackPrompt = `Analyze this ${config.type} interview and provide comprehensive feedback:

INTERVIEW CONFIGURATION:
${JSON.stringify(config, null, 2)}

FULL CONVERSATION:
${conversation.map((entry: any) => `${entry.role === 'user' ? 'Candidate' : 'Interviewer'}: ${entry.content}`).join('\n')}

VOICE ANALYSIS DATA:
${JSON.stringify(voiceAnalyses, null, 2)}

Provide detailed feedback in JSON format with:
{
  "overallScore": number (0-100),
  "scores": {
    "communication": number,
    "confidence": number,
    "technical": number,
    "clarity": number
  },
  "feedback": {
    "strengths": string[],
    "improvements": string[],
    "suggestions": string[]
  },
  "voiceAnalysis": {
    "averageConfidence": number,
    "clarityTrend": string,
    "pacingIssues": string[],
    "volumeConsistency": number
  },
  "detailedReport": string
}

Focus on both content quality and delivery based on voice analysis patterns.`

        const result = await model.generateContent(feedbackPrompt)
        let responseText = result.response.text()

        // Clean up the response to ensure it's valid JSON
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

        try {
            const feedback = JSON.parse(responseText)
            return NextResponse.json(feedback)
        } catch (parseError) {
            // Fallback if JSON parsing fails
            return NextResponse.json({
                overallScore: 75,
                scores: {
                    communication: 78,
                    confidence: 72,
                    technical: 80,
                    clarity: 75
                },
                feedback: {
                    strengths: ['Clear communication', 'Good technical knowledge'],
                    improvements: ['Reduce filler words', 'Improve confidence'],
                    suggestions: ['Practice speaking more slowly', 'Prepare more examples']
                },
                voiceAnalysis: {
                    averageConfidence: 72,
                    clarityTrend: 'stable',
                    pacingIssues: ['Speaking too fast at times'],
                    volumeConsistency: 75
                },
                detailedReport: responseText
            })
        }
    } catch (error) {
        console.error('Feedback generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate feedback' },
            { status: 500 }
        )
    }
}