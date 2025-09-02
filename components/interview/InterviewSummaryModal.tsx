'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, BarChart3, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface InterviewSummaryModalProps {
    isOpen: boolean
    onClose: () => void
    summary: InterviewSummary
    conversation?: any[]
    voiceAnalyses?: any[]
}

export interface InterviewSummary {
    overallScore: number
    duration: number
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
    prediction: 'pass' | 'fail'
    fillerWords: number
    responseTime: number
}

export default function InterviewSummaryModal({ isOpen, onClose, summary, conversation = [], voiceAnalyses = [] }: InterviewSummaryModalProps) {
    const [isSavingToRAG, setIsSavingToRAG] = useState(false)

    const saveToRAG = async () => {
        setIsSavingToRAG(true)
        try {
            const response = await fetch('/api/rag/save-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation,
                    summary,
                    voiceAnalyses
                })
            })

            if (response.ok) {
                alert('Interview data saved to your Second Brain successfully!')
            }
        } catch (error) {
            console.error('Error saving to RAG:', error)
            alert('Failed to save to Second Brain. Please try again.')
        } finally {
            setIsSavingToRAG(false)
        }
    }

    const downloadReport = async () => {
        try {
            const response = await fetch('/api/interview/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(summary),
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `interview-report-${new Date().toISOString().split('T')[0]}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (error) {
            console.error('Failed to download report:', error)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${summary.prediction === 'pass' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {summary.prediction === 'pass' ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Interview Complete</h2>
                                <p className="text-gray-600">
                                    {summary.prediction === 'pass' ? 'Great job!' : 'Keep practicing!'}
                                    {' '}Duration: {Math.floor(summary.duration / 60)}:{(summary.duration % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                        {/* Overall Score */}
                        <div className="text-center mb-8">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="60"
                                        cy="60"
                                        r="50"
                                        stroke={summary.overallScore >= 70 ? "#10b981" : summary.overallScore >= 50 ? "#f59e0b" : "#ef4444"}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(summary.overallScore / 100) * 314} 314`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-900">{summary.overallScore}%</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Overall Score</h3>
                        </div>

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {Object.entries(summary.scores).map(([key, value]) => (
                                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{value}%</div>
                                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium">Response Time</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{summary.responseTime}s</div>
                                <div className="text-sm text-gray-600">Average per question</div>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BarChart3 className="w-5 h-5 text-orange-600" />
                                    <span className="font-medium">Filler Words</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{summary.fillerWords}</div>
                                <div className="text-sm text-gray-600">Total count</div>
                            </div>
                        </div>

                        {/* Feedback Sections */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Strengths
                                </h4>
                                <ul className="space-y-2">
                                    {summary.feedback.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-700">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Areas for Improvement
                                </h4>
                                <ul className="space-y-2">
                                    {summary.feedback.improvements.map((improvement, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-700">{improvement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Suggestions
                                </h4>
                                <ul className="space-y-2">
                                    {summary.feedback.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            <span className="text-gray-700">{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Close
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={downloadReport}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download Report</span>
                            </button>
                            <button
                                onClick={saveToRAG}
                                disabled={isSavingToRAG}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                            >
                                <span>🧠</span>
                                <span>{isSavingToRAG ? 'Saving...' : 'Save to Memory'}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}