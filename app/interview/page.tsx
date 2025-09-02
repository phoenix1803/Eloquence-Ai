'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, Settings, HelpCircle, X, Clock, Volume2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import CameraFeed from '../../components/interview/CameraFeed'
import TranscriptionBox from '../../components/interview/TranscriptionBox'
import TipsPanel from '../../components/interview/TipsPanel'
import InterviewSummaryModal, { InterviewSummary } from '../../components/interview/InterviewSummaryModal'
import { InterviewConfig } from '../../components/interview/InterviewSetupModal'
import { SpeechService } from '../../lib/services/speechService'

interface TranscriptionEntry {
    id: string
    speaker: 'AI' | 'You'
    text: string
    timestamp: Date
    isInterim?: boolean
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

export default function InterviewPage() {
    return (
        <ProtectedRoute>
            <InterviewContent />
        </ProtectedRoute>
    )
}

function InterviewContent() {
    const router = useRouter()
    const [isRecording, setIsRecording] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [showTips, setShowTips] = useState(false)
    const [showSummary, setShowSummary] = useState(false)
    const [transcription, setTranscription] = useState<TranscriptionEntry[]>([])
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [config, setConfig] = useState<InterviewConfig | null>(null)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [currentVoiceAnalysis, setCurrentVoiceAnalysis] = useState<VoiceAnalysis | null>(null)
    const [interimTranscript, setInterimTranscript] = useState('')
    const [isWaitingForAI, setIsWaitingForAI] = useState(false)

    const speechServiceRef = useRef<SpeechService | null>(null)
    const questionCountRef = useRef(0)
    const voiceAnalysesRef = useRef<VoiceAnalysis[]>([])

    // Initialize speech service
    useEffect(() => {
        speechServiceRef.current = new SpeechService()

        // Load config from session storage
        const savedConfig = sessionStorage.getItem('interviewConfig')
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig))
        }

        return () => {
            if (speechServiceRef.current) {
                speechServiceRef.current.stopListening()
            }
        }
    }, [])

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRecording) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isRecording])

    const handleStartInterview = async () => {
        if (!speechServiceRef.current || !config) return

        setIsRecording(true)
        setTimeElapsed(0)
        questionCountRef.current = 0
        voiceAnalysesRef.current = []

        // Start speech recognition
        await speechServiceRef.current.startListening(
            handleTranscript,
            handleVoiceAnalysis
        )

        speechServiceRef.current.startSpeechTimer()

        // Get first question from AI
        await getNextAIResponse()
    }

    const handleTranscript = (transcript: string, isFinal: boolean) => {
        if (isFinal) {
            // Add final transcript
            const newEntry: TranscriptionEntry = {
                id: Date.now().toString(),
                speaker: 'You',
                text: transcript,
                timestamp: new Date(),
                voiceAnalysis: currentVoiceAnalysis || undefined
            }

            setTranscription(prev => [...prev, newEntry])
            setInterimTranscript('')

            // Wait longer for user to finish their complete thought
            setTimeout(() => {
                getNextAIResponse(transcript, currentVoiceAnalysis || undefined)
            }, 2000) // Increased delay to 2 seconds
        } else {
            // Show interim transcript
            setInterimTranscript(transcript)
        }
    }

    const handleVoiceAnalysis = (analysis: VoiceAnalysis) => {
        setCurrentVoiceAnalysis(analysis)
        voiceAnalysesRef.current.push(analysis)
    }

    const getNextAIResponse = async (userResponse?: string, voiceAnalysis?: VoiceAnalysis) => {
        if (!config) return

        setIsWaitingForAI(true)

        try {
            const conversationHistory = transcription
                .map(entry => `${entry.speaker === 'You' ? 'Candidate' : 'Interviewer'}: ${entry.text}`)
                .join('\n')

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: getInterviewPrompt(),
                    conversationHistory,
                    config,
                    voiceAnalysis,
                    userResponse,
                    questionCount: questionCountRef.current
                })
            })

            const data = await response.json()

            if (data.response) {
                const aiEntry: TranscriptionEntry = {
                    id: Date.now().toString(),
                    speaker: 'AI',
                    text: data.response,
                    timestamp: new Date()
                }

                setTranscription(prev => [...prev, aiEntry])
                questionCountRef.current++

                // Speak the AI response
                await speakAIResponse(data.response)

                // Check if interview should end
                if (data.response.toLowerCase().includes('interview is now complete') ||
                    questionCountRef.current >= 8) {
                    setTimeout(() => {
                        handleStopInterview()
                    }, 2000)
                }
            }
        } catch (error) {
            console.error('Error getting AI response:', error)
        } finally {
            setIsWaitingForAI(false)
        }
    }

    const speakAIResponse = async (text: string) => {
        if (!speechServiceRef.current) return

        setIsAISpeaking(true)
        try {
            await speechServiceRef.current.speakWithEnhancedVoice(text)
        } catch (error) {
            console.error('Error speaking AI response:', error)
        } finally {
            setIsAISpeaking(false)
        }
    }

    const getInterviewPrompt = () => {
        if (!config) return ''

        return `You are conducting a ${config.type} interview with the following settings:
- Difficulty: ${config.difficulty}
- Tolerance: ${config.tolerance}
- Personality: ${config.calmness}
- Speed: ${config.speed}
- Time Limit: ${config.timeLimit} minutes
${config.customTopics ? `- Topics: ${config.customTopics.join(', ')}` : ''}

Current question number: ${questionCountRef.current + 1}/8

${questionCountRef.current === 0 ? 'Start with a greeting and ask for self-introduction.' : ''}
${questionCountRef.current > 3 ? 'Consider asking curveball questions or cross-questioning.' : ''}
${questionCountRef.current >= 7 ? 'This should be your final question before concluding.' : ''}

Keep responses under 50 words and ask one question at a time.`
    }

    const handleStopInterview = async () => {
        setIsRecording(false)

        if (speechServiceRef.current) {
            speechServiceRef.current.stopListening()
        }

        // Generate comprehensive feedback
        await generateFeedback()
    }

    const generateFeedback = async () => {
        try {
            const response = await fetch('/api/gemini', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation: transcription,
                    config,
                    voiceAnalyses: voiceAnalysesRef.current
                })
            })

            const feedback = await response.json()

            // Log activity
            await logInterviewActivity(feedback.overallScore)

            // Show summary modal
            setShowSummary(true)
        } catch (error) {
            console.error('Error generating feedback:', error)
            // Show fallback summary
            setShowSummary(true)
        }
    }

    const logInterviewActivity = async (score: number) => {
        try {
            await fetch('/api/interview/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: config?.type || 'hr',
                    duration: timeElapsed,
                    timestamp: new Date().toISOString(),
                    score: score,
                }),
            })
        } catch (error) {
            console.error('Failed to log activity:', error)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Show interim transcript in transcription
    const displayTranscription = [...transcription]
    if (interimTranscript) {
        displayTranscription.push({
            id: 'interim',
            speaker: 'You',
            text: interimTranscript,
            timestamp: new Date(),
            isInterim: true
        })
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-semibold">AI Interview Practice</h1>
                    {config && (
                        <div className="text-sm text-white/70 capitalize">
                            {config.type} • {config.difficulty}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {isRecording && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-red-600/20 rounded-full border border-red-500/30">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-mono">{formatTime(timeElapsed)}</span>
                        </div>
                    )}

                    {isAISpeaking && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30">
                            <Volume2 className="w-4 h-4 animate-pulse" />
                            <span className="text-sm">AI Speaking</span>
                        </div>
                    )}

                    {isWaitingForAI && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-600/20 rounded-full border border-yellow-500/30">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" />
                            <span className="text-sm">AI Thinking...</span>
                        </div>
                    )}

                    <button
                        onClick={() => setShowTips(!showTips)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="h-full pt-20 pb-24 relative">
                {/* Camera Feed - Top Right Corner */}
                <div className="absolute top-6 right-6 z-10">
                    <CameraFeed isOn={isCameraOn} />
                </div>

                {/* Tips Panel - Left Side */}
                <AnimatePresence>
                    {showTips && (
                        <motion.div
                            initial={{ x: -400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -400, opacity: 0 }}
                            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                            className="absolute top-6 left-6 w-80 h-96 z-10"
                        >
                            <TipsPanel voiceAnalysis={currentVoiceAnalysis} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transcription Box - Center */}
                <div className="h-full flex items-center justify-center px-6">
                    <TranscriptionBox
                        transcription={displayTranscription}
                        isRecording={isRecording}
                        isAISpeaking={isAISpeaking}
                        isWaitingForAI={isWaitingForAI}
                    />
                </div>

                {/* Voice Analysis Display - Bottom Left */}
                {currentVoiceAnalysis && isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-32 left-6 w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
                    >
                        <h4 className="text-lg font-semibold mb-4 text-white flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3" />
                            Live Voice Analysis
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Confidence</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${currentVoiceAnalysis.confidence >= 70 ? 'bg-green-500' :
                                                currentVoiceAnalysis.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${currentVoiceAnalysis.confidence}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-medium w-8">{currentVoiceAnalysis.confidence}%</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Clarity</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${currentVoiceAnalysis.clarity >= 70 ? 'bg-green-500' :
                                                currentVoiceAnalysis.clarity >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${currentVoiceAnalysis.clarity}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-medium w-8">{currentVoiceAnalysis.clarity}%</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Pace</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${currentVoiceAnalysis.pace >= 60 && currentVoiceAnalysis.pace <= 80 ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}
                                            style={{ width: `${currentVoiceAnalysis.pace}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-medium w-8">{currentVoiceAnalysis.pace}%</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/80">Volume</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${currentVoiceAnalysis.volume}%` }}
                                        />
                                    </div>
                                    <span className="text-white font-medium w-8">{currentVoiceAnalysis.volume}%</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/20">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">Filler Words:</span>
                                    <span className={`font-medium ${currentVoiceAnalysis.fillerWords <= 2 ? 'text-green-400' :
                                        currentVoiceAnalysis.fillerWords <= 5 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {currentVoiceAnalysis.fillerWords}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-white/80">Hesitations:</span>
                                    <span className={`font-medium ${currentVoiceAnalysis.hesitations <= 2 ? 'text-green-400' :
                                        currentVoiceAnalysis.hesitations <= 5 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {currentVoiceAnalysis.hesitations}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-black/20 backdrop-blur-sm border-t border-white/10">
                <div className="flex items-center justify-center space-x-6">
                    <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={`p-4 rounded-full transition-all duration-200 ${isMicOn
                            ? 'bg-white/10 hover:bg-white/20 hover:scale-110'
                            : 'bg-red-600 hover:bg-red-700 hover:scale-110'
                            }`}
                    >
                        {isMicOn ? (
                            <Mic className="w-6 h-6" />
                        ) : (
                            <MicOff className="w-6 h-6" />
                        )}
                    </button>

                    <button
                        onClick={() => setIsCameraOn(!isCameraOn)}
                        className={`p-4 rounded-full transition-all duration-200 ${isCameraOn
                            ? 'bg-white/10 hover:bg-white/20 hover:scale-110'
                            : 'bg-red-600 hover:bg-red-700 hover:scale-110'
                            }`}
                    >
                        {isCameraOn ? (
                            <Video className="w-6 h-6" />
                        ) : (
                            <VideoOff className="w-6 h-6" />
                        )}
                    </button>

                    {!isRecording ? (
                        <button
                            onClick={handleStartInterview}
                            disabled={!config}
                            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            Start Interview
                        </button>
                    ) : (
                        <button
                            onClick={handleStopInterview}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            End Interview
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Modal */}
            {showSummary && (
                <InterviewSummaryModal
                    isOpen={showSummary}
                    onClose={() => {
                        setShowSummary(false)
                        setTranscription([])
                        setTimeElapsed(0)
                        router.push('/dashboard')
                    }}
                    summary={{
                        overallScore: 78,
                        duration: timeElapsed,
                        scores: {
                            communication: 82,
                            confidence: currentVoiceAnalysis?.confidence || 75,
                            technical: 80,
                            clarity: currentVoiceAnalysis?.clarity || 76,
                        },
                        feedback: {
                            strengths: [
                                'Clear and articulate responses',
                                'Good eye contact with camera',
                                'Professional demeanor throughout',
                            ],
                            improvements: [
                                'Reduce filler words (um, uh)',
                                'Provide more specific examples',
                                'Improve response structure using STAR method',
                            ],
                            suggestions: [
                                'Practice behavioral questions more',
                                'Research company background thoroughly',
                                'Prepare questions to ask the interviewer',
                            ],
                        },
                        prediction: 'pass',
                        fillerWords: voiceAnalysesRef.current.reduce((sum, analysis) => sum + analysis.fillerWords, 0),
                        responseTime: 8.5,
                    }}
                    conversation={transcription}
                    voiceAnalyses={voiceAnalysesRef.current}
                />
            )}
        </div>
    )
}