import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { summary, conversation, voiceAnalyses } = await request.json()

        // Generate comprehensive PDF report
        const pdfContent = await generateDetailedPDF(summary, conversation, voiceAnalyses)

        return new NextResponse(pdfContent, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="interview-report-${new Date().toISOString().split('T')[0]}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Error generating report:', error)
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}

async function generateDetailedPDF(summary: any, conversation: any[], voiceAnalyses: any[]): Promise<Buffer> {
    // Calculate voice statistics
    const avgConfidence = voiceAnalyses.length > 0
        ? voiceAnalyses.reduce((sum, v) => sum + v.confidence, 0) / voiceAnalyses.length
        : 0
    const avgClarity = voiceAnalyses.length > 0
        ? voiceAnalyses.reduce((sum, v) => sum + v.clarity, 0) / voiceAnalyses.length
        : 0
    const totalFillerWords = voiceAnalyses.reduce((sum, v) => sum + v.fillerWords, 0)
    const totalHesitations = voiceAnalyses.reduce((sum, v) => sum + v.hesitations, 0)

    // Generate AI-enhanced insights
    const conversationText = conversation.map(entry => `${entry.speaker}: ${entry.text}`).join('\n')
    const aiInsightsPrompt = `Analyze this interview conversation and provide detailed professional insights:

CONVERSATION:
${conversationText}

PERFORMANCE DATA:
- Overall Score: ${summary.overallScore}%
- Communication: ${summary.scores.communication}%
- Confidence: ${summary.scores.confidence}%
- Technical: ${summary.scores.technical}%
- Clarity: ${summary.scores.clarity}%
- Avg Voice Confidence: ${avgConfidence.toFixed(1)}%
- Filler Words: ${totalFillerWords}
- Hesitations: ${totalHesitations}

Provide:
1. Key behavioral patterns observed
2. Communication style analysis
3. Technical competency assessment
4. Specific improvement strategies
5. Industry-specific advice

Keep it professional and actionable.`

    let aiInsights = ''
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/gemini`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: aiInsightsPrompt,
                conversationHistory: '',
                config: { type: 'analysis' }
            })
        })
        const data = await response.json()
        aiInsights = data.response || 'AI analysis temporarily unavailable.'
    } catch (error) {
        aiInsights = 'AI analysis temporarily unavailable.'
    }

    const reportContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ELOQUENCE-AI INTERVIEW ANALYSIS REPORT                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════════════════════
Date: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
Duration: ${Math.floor(summary.duration / 60)}:${(summary.duration % 60).toString().padStart(2, '0')}
Overall Performance: ${summary.overallScore}% (${summary.prediction.toUpperCase()})

🎯 PERFORMANCE BREAKDOWN
═══════════════════════════════════════════════════════════════════════════════
┌─────────────────────┬─────────┬─────────────────────────────────────────────┐
│ Skill Area          │ Score   │ Assessment                                  │
├─────────────────────┼─────────┼─────────────────────────────────────────────┤
│ Communication       │ ${summary.scores.communication.toString().padEnd(7)} │ ${getScoreAssessment(summary.scores.communication).padEnd(43)} │
│ Confidence          │ ${summary.scores.confidence.toString().padEnd(7)} │ ${getScoreAssessment(summary.scores.confidence).padEnd(43)} │
│ Technical Knowledge │ ${summary.scores.technical.toString().padEnd(7)} │ ${getScoreAssessment(summary.scores.technical).padEnd(43)} │
│ Speech Clarity      │ ${summary.scores.clarity.toString().padEnd(7)} │ ${getScoreAssessment(summary.scores.clarity).padEnd(43)} │
└─────────────────────┴─────────┴─────────────────────────────────────────────┘

🎤 VOICE ANALYSIS INSIGHTS
═══════════════════════════════════════════════════════════════════════════════
Voice Confidence Level: ${avgConfidence.toFixed(1)}% ${getConfidenceEmoji(avgConfidence)}
Speech Clarity: ${avgClarity.toFixed(1)}% ${getClarityEmoji(avgClarity)}
Filler Words Count: ${totalFillerWords} ${getFillerWordsEmoji(totalFillerWords)}
Hesitation Instances: ${totalHesitations} ${getHesitationEmoji(totalHesitations)}
Average Response Time: ${summary.responseTime}s

🤖 AI-POWERED INSIGHTS
═══════════════════════════════════════════════════════════════════════════════
${aiInsights}

📈 DETAILED VOICE PATTERNS
═══════════════════════════════════════════════════════════════════════════════
${voiceAnalyses.map((analysis, index) => `
Response ${index + 1}:
├─ Confidence: ${analysis.confidence}% ${'█'.repeat(Math.floor(analysis.confidence / 10))}
├─ Clarity: ${analysis.clarity}% ${'█'.repeat(Math.floor(analysis.clarity / 10))}
├─ Pace: ${analysis.pace}% ${'█'.repeat(Math.floor(analysis.pace / 10))}
├─ Volume: ${analysis.volume}% ${'█'.repeat(Math.floor(analysis.volume / 10))}
├─ Filler Words: ${analysis.fillerWords}
└─ Hesitations: ${analysis.hesitations}
`).join('')}

💬 COMPLETE INTERVIEW TRANSCRIPT
═══════════════════════════════════════════════════════════════════════════════
${conversation.map((entry, index) => `
[${(index + 1).toString().padStart(2, '0')}] ${entry.speaker === 'You' ? '🧑 CANDIDATE' : '🤖 INTERVIEWER'}: 
${entry.text}
${entry.voiceAnalysis ? `    📊 Voice Metrics: Confidence ${entry.voiceAnalysis.confidence}% | Clarity ${entry.voiceAnalysis.clarity}%` : ''}
`).join('\n')}

✅ STRENGTHS IDENTIFIED
═══════════════════════════════════════════════════════════════════════════════
${summary.feedback.strengths.map((strength: string, index: number) => `${index + 1}. ✓ ${strength}`).join('\n')}

⚠️  AREAS FOR IMPROVEMENT
═══════════════════════════════════════════════════════════════════════════════
${summary.feedback.improvements.map((improvement: string, index: number) => `${index + 1}. ⚡ ${improvement}`).join('\n')}

🎯 ACTIONABLE RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════════
${summary.feedback.suggestions.map((suggestion: string, index: number) => `${index + 1}. 🎯 ${suggestion}`).join('\n')}

🗣️  VOICE COACHING PLAN
═══════════════════════════════════════════════════════════════════════════════
${avgConfidence < 60 ? '🔸 CONFIDENCE BUILDING: Practice power poses, positive self-talk, and mock interviews\n' : ''}${avgClarity < 70 ? '🔸 SPEECH CLARITY: Focus on articulation exercises and speaking slower\n' : ''}${totalFillerWords > 10 ? '🔸 FILLER WORD REDUCTION: Practice pause-and-breathe technique instead of "um/uh"\n' : ''}${totalHesitations > 5 ? '🔸 FLUENCY IMPROVEMENT: Work on smooth speech flow and preparation techniques\n' : ''}

📋 NEXT STEPS ACTION PLAN
═══════════════════════════════════════════════════════════════════════════════
□ 1. Review this analysis and highlight top 3 improvement areas
□ 2. Practice STAR method for behavioral questions
□ 3. Record yourself answering common questions
□ 4. Focus on voice coaching recommendations above
□ 5. Schedule follow-up practice session in 1 week
□ 6. Research company-specific interview questions
□ 7. Prepare thoughtful questions to ask the interviewer

📊 PERFORMANCE TRENDS
═══════════════════════════════════════════════════════════════════════════════
Confidence Trend: ${calculateTrend(voiceAnalyses.map(v => v.confidence))} ${getTrendEmoji(calculateTrend(voiceAnalyses.map(v => v.confidence)))}
Clarity Trend: ${calculateTrend(voiceAnalyses.map(v => v.clarity))} ${getTrendEmoji(calculateTrend(voiceAnalyses.map(v => v.clarity)))}

═══════════════════════════════════════════════════════════════════════════════
Generated by Eloquence-AI | ${new Date().toISOString()}
For support: Visit our Second Brain for personalized coaching
═══════════════════════════════════════════════════════════════════════════════
  `

    return Buffer.from(reportContent, 'utf8')
}

function getScoreAssessment(score: number): string {
    if (score >= 90) return 'Excellent - Industry Leading'
    if (score >= 80) return 'Very Good - Above Average'
    if (score >= 70) return 'Good - Meets Expectations'
    if (score >= 60) return 'Fair - Needs Improvement'
    return 'Poor - Requires Focus'
}

function getConfidenceEmoji(confidence: number): string {
    if (confidence >= 80) return '🔥'
    if (confidence >= 60) return '👍'
    if (confidence >= 40) return '⚡'
    return '🎯'
}

function getClarityEmoji(clarity: number): string {
    if (clarity >= 80) return '🎤'
    if (clarity >= 60) return '🔊'
    return '📢'
}

function getFillerWordsEmoji(count: number): string {
    if (count <= 3) return '✅'
    if (count <= 8) return '⚠️'
    return '🚨'
}

function getHesitationEmoji(count: number): string {
    if (count <= 2) return '✅'
    if (count <= 5) return '⚠️'
    return '🚨'
}

function getTrendEmoji(trend: string): string {
    if (trend.includes('Improving')) return '📈'
    if (trend.includes('Declining')) return '📉'
    return '➡️'
}

function calculateTrend(values: number[]): string {
    if (values.length < 2) return 'Insufficient data'
    const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(values.length / 2)
    const second = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / (values.length - Math.floor(values.length / 2))

    if (second > first + 5) return 'Improving throughout interview'
    if (second < first - 5) return 'Declining throughout interview'
    return 'Stable throughout interview'
}