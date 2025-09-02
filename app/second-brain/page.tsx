'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Code, MessageCircle, Users, Brain, Target } from 'lucide-react'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Message {
    id: string
    type: 'user' | 'assistant'
    content: string
    timestamp: Date
    isCode?: boolean
    language?: string
    score?: number
}

export default function SecondBrainPage() {
    return (
        <ProtectedRoute>
            <SecondBrainContent />
        </ProtectedRoute>
    )
}

function SecondBrainContent() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [mode, setMode] = useState<'companion' | 'mock'>('companion')
    const [showCodeEditor, setShowCodeEditor] = useState(false)
    const [codeContent, setCodeContent] = useState('')
    const [codeLanguage, setCodeLanguage] = useState('javascript')
    const [mockSetupComplete, setMockSetupComplete] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        // Reset messages when mode changes
        if (mode === 'companion') {
            setMessages([{
                id: '1',
                type: 'assistant',
                content: `Hello! I'm your **AI Companion** - here to guide and support you through your interview preparation journey.

I'm here to:
- 🎯 **Guide your learning** with personalized advice
- 💡 **Answer your questions** about interview techniques
- 🤝 **Support you** through challenges and setbacks
- 📈 **Track your progress** and celebrate improvements
- 🧠 **Share insights** from your past interview sessions

What would you like to work on today? I'm here to help you succeed!`,
                timestamp: new Date()
            }])
            setMockSetupComplete(false)
        } else {
            setMessages([{
                id: '1',
                type: 'assistant',
                content: `Welcome to **Mock Interview Mode**! 🎯

I'll conduct a realistic interview simulation with you. First, let me know:

**What type of interview would you like to practice?**

1. 💼 **Behavioral Interview** - STAR method, past experiences
2. 💻 **Technical Interview** - Coding, system design, algorithms  
3. 🏢 **HR Interview** - Culture fit, motivations, career goals
4. 🎯 **Custom Topic** - Specific skills or industry focus

Just tell me what you'd like to prepare for, and I'll start asking you relevant questions!`,
                timestamp: new Date()
            }])
            setMockSetupComplete(false)
        }
    }, [mode])

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !showCodeEditor) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: showCodeEditor ? codeContent : inputValue,
            timestamp: new Date(),
            isCode: showCodeEditor,
            language: showCodeEditor ? codeLanguage : undefined
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setCodeContent('')
        setShowCodeEditor(false)
        setIsLoading(true)

        try {
            const response = await fetch('/api/second-brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    mode,
                    isCode: userMessage.isCode,
                    language: userMessage.language,
                    conversationHistory: messages.slice(-5),
                    mockSetupComplete
                })
            })

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: data.response,
                timestamp: new Date(),
                score: data.score
            }

            setMessages(prev => [...prev, assistantMessage])

            // Mark mock setup as complete after first interaction
            if (mode === 'mock' && !mockSetupComplete) {
                setMockSetupComplete(true)
            }
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const getModeColors = () => {
        return mode === 'companion'
            ? {
                primary: 'bg-blue-600 hover:bg-blue-700',
                secondary: 'bg-blue-50 text-blue-900',
                accent: 'text-blue-600',
                gradient: 'from-blue-50 to-indigo-50'
            }
            : {
                primary: 'bg-orange-600 hover:bg-orange-700',
                secondary: 'bg-orange-50 text-orange-900',
                accent: 'text-orange-600',
                gradient: 'from-orange-50 to-red-50'
            }
    }

    const colors = getModeColors()

    return (
        <div className={`min-h-screen pt-16 bg-gradient-to-br ${colors.gradient}`}>
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Second Brain</h1>
                            <p className="text-gray-600">
                                {mode === 'companion'
                                    ? 'Your AI companion for interview preparation and guidance'
                                    : 'Mock interview mode - Practice with realistic interview scenarios'
                                }
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setMode('companion')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${mode === 'companion'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Brain className="w-4 h-4" />
                                <span>Companion</span>
                            </button>
                            <button
                                onClick={() => setMode('mock')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${mode === 'mock'
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Target className="w-4 h-4" />
                                <span>Mock</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Messages */}
                    <div className="h-[400px] overflow-y-auto p-4 space-y-3">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-4xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                                        <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                                                ? colors.primary.replace('hover:bg-', 'bg-').split(' ')[0]
                                                : mode === 'companion' ? 'bg-blue-100' : 'bg-orange-100'
                                                }`}>
                                                {message.type === 'user' ? (
                                                    <Users className="w-4 h-4 text-white" />
                                                ) : mode === 'companion' ? (
                                                    <Brain className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <Target className="w-4 h-4 text-orange-600" />
                                                )}
                                            </div>

                                            <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {message.type === 'user' ? 'You' : mode === 'companion' ? 'Companion' : 'Interviewer'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                    {message.score && (
                                                        <span className={`text-xs px-2 py-1 rounded-full ${message.score >= 8 ? 'bg-green-100 text-green-800' :
                                                            message.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            Score: {message.score}/10
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={`p-4 rounded-lg ${message.type === 'user'
                                                    ? colors.primary.replace('hover:bg-', 'bg-').split(' ')[0] + ' text-white'
                                                    : 'bg-gray-50 text-gray-900'
                                                    }`}>
                                                    {message.isCode ? (
                                                        <SyntaxHighlighter
                                                            language={message.language || 'javascript'}
                                                            style={oneDark}
                                                            customStyle={{
                                                                margin: 0,
                                                                borderRadius: '6px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            {message.content}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <ReactMarkdown
                                                            components={{
                                                                code: ({ node, inline, className, children, ...props }) => {
                                                                    const match = /language-(\w+)/.exec(className || '')
                                                                    return !inline && match ? (
                                                                        <SyntaxHighlighter
                                                                            style={oneDark}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            customStyle={{
                                                                                margin: '8px 0',
                                                                                borderRadius: '6px',
                                                                                fontSize: '14px'
                                                                            }}
                                                                            {...props}
                                                                        >
                                                                            {String(children).replace(/\n$/, '')}
                                                                        </SyntaxHighlighter>
                                                                    ) : (
                                                                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === 'companion' ? 'bg-blue-100' : 'bg-orange-100'
                                        }`}>
                                        {mode === 'companion' ? (
                                            <Brain className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <Target className="w-4 h-4 text-orange-600" />
                                        )}
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4">
                        {showCodeEditor ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <select
                                        value={codeLanguage}
                                        onChange={(e) => setCodeLanguage(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                    >
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="sql">SQL</option>
                                        <option value="typescript">TypeScript</option>
                                    </select>
                                    <button
                                        onClick={() => setShowCodeEditor(false)}
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <textarea
                                    value={codeContent}
                                    onChange={(e) => setCodeContent(e.target.value)}
                                    placeholder="Paste your code here..."
                                    className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!codeContent.trim() || isLoading}
                                    className={`px-4 py-2 ${colors.primary} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Submit Code
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-end space-x-3">
                                <div className="flex-1">
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={
                                            mode === 'companion'
                                                ? 'Ask me anything about interviews, communication, or career advice...'
                                                : mockSetupComplete
                                                    ? 'Answer the interview question above...'
                                                    : 'Tell me what type of interview you want to practice...'
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setShowCodeEditor(true)}
                                        className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Add code"
                                    >
                                        <Code className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className={`p-3 ${colors.primary} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}