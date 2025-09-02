'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Camera, FileText, BarChart3, ArrowRight } from 'lucide-react'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import InterviewSetupModal, { InterviewConfig } from '../../components/interview/InterviewSetupModal'

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}

function DashboardContent() {
    const { user } = useUser()
    const router = useRouter()
    const [showInterviewSetup, setShowInterviewSetup] = useState(false)

    const handleStartInterview = (config: InterviewConfig) => {
        // Store config in sessionStorage or pass as query params
        sessionStorage.setItem('interviewConfig', JSON.stringify(config))
        router.push('/interview')
    }

    const handleInterviewClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setShowInterviewSetup(true)
    }

    return (
        <div className="min-h-screen pt-16 bg-gray-50">
            <div className="section-padding py-12">
                <div className="container-max">
                    {/* Welcome Section */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.firstName}!
                        </h1>
                        <p className="text-xl text-gray-600">
                            Ready to practice and improve your interview skills?
                        </p>
                    </motion.div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {dashboardOptions.map((option, index) => (
                            <motion.div
                                key={option.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="group"
                            >
                                {option.title === 'AI Interview Practice' ? (
                                    <div
                                        onClick={handleInterviewClick}
                                        data-interview-trigger
                                        className="card h-full cursor-pointer group-hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <option.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-black transition-colors">
                                            {option.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">{option.description}</p>
                                        <div className="text-sm text-gray-500">{option.status}</div>
                                    </div>
                                ) : (
                                    <Link href={option.href}>
                                        <div className="card h-full cursor-pointer group-hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                    <option.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-black transition-colors">
                                                {option.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4">{option.description}</p>
                                            <div className="text-sm text-gray-500">{option.status}</div>
                                        </div>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                        className="mt-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Recent Activity
                        </h2>
                        <RecentActivity />
                    </motion.div>
                </div>
            </div>

            {/* Interview Setup Modal */}
            <InterviewSetupModal
                isOpen={showInterviewSetup}
                onClose={() => setShowInterviewSetup(false)}
                onStart={handleStartInterview}
            />
        </div>
    )
}

function RecentActivity() {
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/interview/activity')
            if (response.ok) {
                const data = await response.json()
                setActivities(data.slice(0, 5)) // Show only last 5
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        return `${minutes}m`
    }

    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                </div>
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className="card">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No activity yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Start your first interview practice session to see your progress here.
                    </p>
                    <button
                        onClick={() => document.querySelector('[data-interview-trigger]')?.click()}
                        className="btn-primary"
                    >
                        Start Practicing
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Link href="/analytics" className="text-sm text-gray-600 hover:text-black transition-colors">
                    View All
                </Link>
            </div>
            <div className="space-y-4">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 capitalize text-sm">
                                    {activity.type} Interview
                                </h4>
                                <p className="text-xs text-gray-600">
                                    {formatDate(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-xs font-medium text-gray-900">
                                    {formatDuration(activity.duration)}
                                </div>
                            </div>
                            <div className={`text-xs font-medium ${activity.score >= 70 ? 'text-green-600' :
                                activity.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {activity.score}%
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const dashboardOptions = [
    {
        title: 'AI Interview Practice',
        description:
            'Practice with AI-powered interviews tailored to your industry and experience level.',
        href: '/interview',
        icon: Camera,
        status: 'Ready to start',
    },
    {
        title: 'Second Brain',
        description:
            'Your AI companion for interview preparation, knowledge management, and skill development.',
        href: '/second-brain',
        icon: FileText,
        status: 'Ready to use',
    },
    {
        title: 'Performance Analytics',
        description:
            'Track your progress and identify areas for improvement over time.',
        href: '/analytics',
        icon: BarChart3,
        status: 'Ready to use',
    },
    {
        title: 'Coming Soon',
        description:
            'New features are being developed to enhance your interview preparation experience.',
        href: '#',
        icon: BarChart3,
        status: 'In development',
    },
]