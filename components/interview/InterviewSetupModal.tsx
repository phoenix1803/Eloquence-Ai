'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Code, Settings, Mic, Camera, Volume2, Play } from 'lucide-react'

interface InterviewSetupModalProps {
    isOpen: boolean
    onClose: () => void
    onStart: (config: InterviewConfig) => void
}

export interface InterviewConfig {
    type: 'hr' | 'technical' | 'custom'
    difficulty: 'easy' | 'medium' | 'hard'
    tolerance: 'strict' | 'forgiving'
    calmness: 'professional' | 'friendly'
    speed: 'slow' | 'normal' | 'fast'
    timeLimit: number
    customTopics?: string[]
    realTimeFeedback: boolean
}

export default function InterviewSetupModal({ isOpen, onClose, onStart }: InterviewSetupModalProps) {
    const [config, setConfig] = useState<InterviewConfig>({
        type: 'hr',
        difficulty: 'medium',
        tolerance: 'forgiving',
        calmness: 'professional',
        speed: 'normal',
        timeLimit: 30,
        customTopics: [],
        realTimeFeedback: false,
    })

    const [currentStep, setCurrentStep] = useState(1)
    const [customTopic, setCustomTopic] = useState('')
    const [deviceTests, setDeviceTests] = useState({
        microphone: false,
        camera: false,
        audio: false,
    })

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleStart = () => {
        onStart(config)
        onClose()
    }

    const addCustomTopic = () => {
        if (customTopic.trim() && config.customTopics) {
            setConfig({
                ...config,
                customTopics: [...config.customTopics, customTopic.trim()]
            })
            setCustomTopic('')
        }
    }

    const removeCustomTopic = (index: number) => {
        if (config.customTopics) {
            setConfig({
                ...config,
                customTopics: config.customTopics.filter((_, i) => i !== index)
            })
        }
    }

    const testDevice = async (device: 'microphone' | 'camera' | 'audio') => {
        try {
            if (device === 'microphone') {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                stream.getTracks().forEach(track => track.stop())
                setDeviceTests(prev => ({ ...prev, microphone: true }))
            } else if (device === 'camera') {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                stream.getTracks().forEach(track => track.stop())
                setDeviceTests(prev => ({ ...prev, camera: true }))
            } else if (device === 'audio') {
                // Test audio playback
                const audio = new Audio('/test-audio.mp3')
                audio.play().catch(() => { })
                setDeviceTests(prev => ({ ...prev, audio: true }))
            }
        } catch (error) {
            console.error(`Failed to test ${device}:`, error)
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
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Setup Interview</h2>
                            <p className="text-gray-600">Step {currentStep} of 3</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 py-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-black h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {currentStep === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Select Interview Type</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { type: 'hr', icon: Users, title: 'HR Interview', desc: 'Behavioral and general questions' },
                                            { type: 'technical', icon: Code, title: 'Technical Interview', desc: 'Role-specific technical questions' },
                                            { type: 'custom', icon: Settings, title: 'Custom Interview', desc: 'Your own topics and questions' },
                                        ].map((option) => (
                                            <button
                                                key={option.type}
                                                onClick={() => setConfig({ ...config, type: option.type as any })}
                                                className={`p-4 border-2 rounded-xl text-left transition-all ${config.type === option.type
                                                        ? 'border-black bg-gray-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <option.icon className="w-8 h-8 mb-2" />
                                                <h4 className="font-semibold">{option.title}</h4>
                                                <p className="text-sm text-gray-600">{option.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {config.type === 'custom' && (
                                    <div>
                                        <h4 className="font-semibold mb-2">Custom Topics</h4>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={customTopic}
                                                onChange={(e) => setCustomTopic(e.target.value)}
                                                placeholder="Add a topic or question"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                                onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
                                            />
                                            <button
                                                onClick={addCustomTopic}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {config.customTopics?.map((topic, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                                                >
                                                    {topic}
                                                    <button
                                                        onClick={() => removeCustomTopic(index)}
                                                        className="text-gray-500 hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Customization Options</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                                            <select
                                                value={config.difficulty}
                                                onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            >
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                                            <input
                                                type="number"
                                                value={config.timeLimit}
                                                onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) })}
                                                min="5"
                                                max="120"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">AI Tolerance</label>
                                            <select
                                                value={config.tolerance}
                                                onChange={(e) => setConfig({ ...config, tolerance: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            >
                                                <option value="forgiving">Forgiving</option>
                                                <option value="strict">Strict</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">AI Personality</label>
                                            <select
                                                value={config.calmness}
                                                onChange={(e) => setConfig({ ...config, calmness: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            >
                                                <option value="professional">Professional</option>
                                                <option value="friendly">Friendly</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Question Speed</label>
                                            <select
                                                value={config.speed}
                                                onChange={(e) => setConfig({ ...config, speed: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            >
                                                <option value="slow">Slow</option>
                                                <option value="normal">Normal</option>
                                                <option value="fast">Fast</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="realTimeFeedback"
                                                checked={config.realTimeFeedback}
                                                onChange={(e) => setConfig({ ...config, realTimeFeedback: e.target.checked })}
                                                className="mr-2"
                                            />
                                            <label htmlFor="realTimeFeedback" className="text-sm font-medium">
                                                Enable real-time feedback
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Device Test</h3>
                                    <p className="text-gray-600 mb-6">Test your devices before starting the interview</p>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'microphone', icon: Mic, label: 'Microphone', desc: 'Test your microphone' },
                                            { key: 'camera', icon: Camera, label: 'Camera', desc: 'Test your camera' },
                                            { key: 'audio', icon: Volume2, label: 'Audio Playback', desc: 'Test AI voice playback' },
                                        ].map((device) => (
                                            <div key={device.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <device.icon className="w-5 h-5 text-gray-600" />
                                                    <div>
                                                        <h4 className="font-medium">{device.label}</h4>
                                                        <p className="text-sm text-gray-600">{device.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => testDevice(device.key as any)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${deviceTests[device.key as keyof typeof deviceTests]
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                        }`}
                                                >
                                                    {deviceTests[device.key as keyof typeof deviceTests] ? 'Tested ✓' : 'Test'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>

                        <div className="flex space-x-3">
                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleStart}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <Play className="w-4 h-4" />
                                    <span>Start Interview</span>
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}