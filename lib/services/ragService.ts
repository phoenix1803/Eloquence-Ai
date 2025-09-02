interface RAGDocument {
    id: string
    content: string
    metadata: {
        type: 'interview_qa' | 'technique' | 'feedback' | 'conversation'
        timestamp: string
        tags?: string[]
        score?: number
    }
}

export class RAGService {
    private static instance: RAGService
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.RAG_SERVICE_URL || 'http://localhost:8000'
    }

    static getInstance(): RAGService {
        if (!RAGService.instance) {
            RAGService.instance = new RAGService()
        }
        return RAGService.instance
    }

    async searchSimilar(query: string, limit: number = 5): Promise<RAGDocument[]> {
        try {
            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    limit,
                    threshold: 0.7 // Similarity threshold
                })
            })

            if (!response.ok) {
                console.warn('RAG search failed, returning empty results')
                return []
            }

            const data = await response.json()
            return data.results || []
        } catch (error) {
            console.error('RAG search error:', error)
            return []
        }
    }

    async addDocument(document: Omit<RAGDocument, 'id'>): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...document,
                    id: this.generateId()
                })
            })

            return response.ok
        } catch (error) {
            console.error('RAG add document error:', error)
            return false
        }
    }

    async addInterviewData(
        conversation: any[],
        summary: any,
        voiceAnalyses: any[]
    ): Promise<boolean> {
        try {
            // Add conversation as searchable content
            const conversationText = conversation
                .map(entry => `${entry.speaker}: ${entry.text}`)
                .join('\n')

            await this.addDocument({
                content: `Interview Conversation:\n${conversationText}\n\nSummary: Score ${summary.overallScore}%, ${summary.prediction}`,
                metadata: {
                    type: 'conversation',
                    timestamp: new Date().toISOString(),
                    score: summary.overallScore,
                    tags: ['interview', 'conversation', summary.prediction]
                }
            })

            // Add key insights as separate documents
            for (const strength of summary.feedback.strengths) {
                await this.addDocument({
                    content: `Strength identified: ${strength}`,
                    metadata: {
                        type: 'feedback',
                        timestamp: new Date().toISOString(),
                        tags: ['strength', 'positive']
                    }
                })
            }

            for (const improvement of summary.feedback.improvements) {
                await this.addDocument({
                    content: `Area for improvement: ${improvement}`,
                    metadata: {
                        type: 'feedback',
                        timestamp: new Date().toISOString(),
                        tags: ['improvement', 'development']
                    }
                })
            }

            return true
        } catch (error) {
            console.error('Error adding interview data to RAG:', error)
            return false
        }
    }

    async getRecentDocuments(limit: number = 10): Promise<RAGDocument[]> {
        try {
            const response = await fetch(`${this.baseUrl}/recent?limit=${limit}`)

            if (!response.ok) {
                return []
            }

            const data = await response.json()
            return data.documents || []
        } catch (error) {
            console.error('Error fetching recent documents:', error)
            return []
        }
    }

    private generateId(): string {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
}

export const ragService = RAGService.getInstance()