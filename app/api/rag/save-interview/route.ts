import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { ragService } from '../../../../lib/services/ragService'

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { conversation, summary, voiceAnalyses } = await request.json()

        // Save interview data to RAG
        const success = await ragService.addInterviewData(conversation, summary, voiceAnalyses)

        if (success) {
            return NextResponse.json({ success: true, message: 'Interview data saved to RAG successfully' })
        } else {
            return NextResponse.json({ error: 'Failed to save to RAG' }, { status: 500 })
        }
    } catch (error) {
        console.error('Error saving interview to RAG:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}