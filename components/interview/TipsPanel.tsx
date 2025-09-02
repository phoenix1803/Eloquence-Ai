'use client'
import React from "react";

import { motion } from 'framer-motion'
import { Lightbulb, CheckCircle, AlertCircle, Star } from 'lucide-react'

interface VoiceAnalysis {
    confidence: number
    clarity: number
    pace: number
    volume: number
    fillerWords: number
    hesitations: number
}

interface TipsPanelProps {
    voiceAnalysis?: VoiceAnalysis | null
}

export default function TipsPanel({ voiceAnalysis }: TipsPanelProps) {
    return (
        <div className="h-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-y-auto shadow-2xl">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                    Interview Tips
                </h3>
                <p className="text-sm text-gray-400">
                    Real-time guidance to help you succeed
                </p>
            </div>

            <div className="space-y-6">
                {/* Real-time Voice Analysis */}
                {voiceAnalysis && (
                    <div>
                        <h4 className="font-medium mb-3 text-blue-400 flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            Live Voice Analysis
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Confidence:</span>
                                <span className={`font-medium ${voiceAnalysis.confidence >= 70 ? 'text-green-400' : voiceAnalysis.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {voiceAnalysis.confidence}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Clarity:</span>
                                <span className={`font-medium ${voiceAnalysis.clarity >= 70 ? 'text-green-400' : voiceAnalysis.clarity >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {voiceAnalysis.clarity}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Speaking Pace:</span>
                                <span className={`font-medium ${voiceAnalysis.pace >= 60 && voiceAnalysis.pace <= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {voiceAnalysis.pace}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Filler Words:</span>
                                <span className={`font-medium ${voiceAnalysis.fillerWords <= 2 ? 'text-green-400' : voiceAnalysis.fillerWords <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {voiceAnalysis.fillerWords}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Tips */}
                <div>
                    <h4 className="font-medium mb-3 text-green-400 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        You're doing well
                    </h4>
                    <div className="space-y-2">
                        {currentTips.map((tip, index) => (
                            <motion.div
                                key={index}
                                className="text-sm text-white/90 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {tip}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Improvement Areas */}
                <div>
                    <h4 className="font-medium mb-3 text-orange-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Areas to improve
                    </h4>
                    <div className="space-y-2">
                        {improvementTips.map((tip, index) => (
                            <motion.div
                                key={index}
                                className="text-sm text-white/90 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                            >
                                {tip}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* General Tips */}
                <div>
                    <h4 className="font-medium mb-3 text-blue-400 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        General advice
                    </h4>
                    <div className="space-y-2">
                        {generalTips.map((tip, index) => (
                            <motion.div
                                key={index}
                                className="text-sm text-white/90 bg-white/10 p-3 rounded-lg backdrop-blur-sm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.6 }}
                            >
                                {tip}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                        <button className="w-full text-left text-sm bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors backdrop-blur-sm">
                            📝 Take a note
                        </button>
                        <button className="w-full text-left text-sm bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors backdrop-blur-sm">
                            ⏸️ Pause for feedback
                        </button>
                        <button className="w-full text-left text-sm bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors backdrop-blur-sm">
                            🔄 Restart question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const currentTips = [
    'Good eye contact with the camera',
    'Clear and confident speaking voice',
    'Professional background setup',
]

const improvementTips = [
    'Try to reduce filler words like "um" and "uh"',
    'Provide more specific examples in your answers',
    'Maintain better posture throughout the interview',
]

const generalTips = [
    'Use the STAR method for behavioral questions',
    'Ask thoughtful questions about the role',
    'Show enthusiasm for the opportunity',
    'Keep answers concise but comprehensive',
]