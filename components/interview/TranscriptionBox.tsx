'use client'
import React from "react";

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User } from 'lucide-react'

interface TranscriptionEntry {
    id: string
    speaker: 'AI' | 'You'
    text: string
    timestamp: Date
}

interface TranscriptionBoxProps {
    transcription: TranscriptionEntry[]
    isRecording: boolean
    isAISpeaking?: boolean
    isWaitingForAI?: boolean
}

export default function TranscriptionBox({
    transcription,
    isRecording,
    isAISpeaking = false,
    isWaitingForAI = false,
}: TranscriptionBoxProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [transcription])

    if (!isRecording && transcription.length === 0) {
        return (
            <motion.div
                className="w-full max-w-5xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/10 shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
                <p className="text-gray-400 mb-6">
                    Click "Start Interview" to begin your AI-powered practice session.
                    Your conversation will appear here in real-time.
                </p>
                <div className="text-sm text-gray-500">
                    Make sure your microphone and camera are enabled for the best
                    experience.
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="w-full max-w-5xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold">Live Transcription</h3>
                {isRecording && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">Recording</span>
                    </div>
                )}
            </div>

            {/* Transcription Content */}
            <div
                ref={scrollRef}
                className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            >
                <AnimatePresence>
                    {transcription.map((entry) => (
                        <motion.div
                            key={entry.id}
                            className={`flex items-start space-x-3 ${entry.speaker === 'You' ? 'flex-row-reverse space-x-reverse' : ''
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.speaker === 'AI'
                                    ? 'bg-blue-600'
                                    : 'bg-green-600'
                                    }`}
                            >
                                {entry.speaker === 'AI' ? (
                                    <Bot className="w-4 h-4" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <div
                                className={`flex-1 ${entry.speaker === 'You' ? 'text-right' : ''
                                    }`}
                            >
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm font-medium">
                                        {entry.speaker === 'AI' ? 'AI Interviewer' : 'You'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {entry.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div
                                    className={`p-3 rounded-lg ${entry.speaker === 'AI'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-blue-600 text-white'
                                        }`}
                                >
                                    {entry.text}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* AI Status Indicators */}
                {isWaitingForAI && (
                    <motion.div
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/10 rounded-lg p-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {isAISpeaking && (
                    <motion.div
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-sm text-white/90">Speaking...</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}