'use client'
import React from "react";

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProtectedRoute from '../../components/auth/ProtectedRoute'
import { BarChart3, TrendingUp, Calendar, Clock, Download } from 'lucide-react'

interface Activity {
    id: string
    type: string
    duration: number
    score: number
    timestamp: string
    status: string
}

export default function AnalyticsPage() {
    return (
        <ProtectedRoute>
            <AnalyticsContent />
        </ProtectedRoute>
    )
}

function AnalyticsContent() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/interview/activity')
            if (response.ok) {
                const data = await response.json()
                setActivities(data)
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error)
        } finally {
            setLoading(false)
        }
    }

    const averageScore = activities.length > 0
        ? Math.round(activities.reduce((sum, activity) => sum + activity.score, 0) / activities.length)
        : 0

    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0)

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-16 bg-gray-50">
            <div className="section-padding py-12">
                <div className="container-max">
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Performance Analytics
                        </h1>
                        <p className="text-xl text-gray-600">
                            Track your interview performance and progress over time.
                        </p>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Total Sessions</h3>
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{activities.length}</div>
                            <p className="text-sm text-gray-600">Interview sessions completed</p>
                        </motion.div>

                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Average Score</h3>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {activities.length > 0 ? `${averageScore}%` : '--'}
                            </div>
                            <p className="text-sm text-gray-600">Overall performance</p>
                        </motion.div>

                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Total Time</h3>
                                <Clock className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {totalDuration > 0 ? formatDuration(totalDuration) : '--'}
                            </div>
                            <p className="text-sm text-gray-600">Practice time</p>
                        </motion.div>

                        <motion.div
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">This Month</h3>
                                <Calendar className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {activities.filter(a =>
                                    new Date(a.timestamp).getMonth() === new Date().getMonth()
                                ).length}
                            </div>
                            <p className="text-sm text-gray-600">Sessions this month</p>
                        </motion.div>
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            {activities.length > 0 && (
                                <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors">
                                    <Download className="w-4 h-4" />
                                    <span>Export Data</span>
                                </button>
                            )}
                        </div>

                        {activities.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BarChart3 className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No activity yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Complete your first interview to see detailed analytics here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                                <BarChart3 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 capitalize">
                                                    {activity.type} Interview
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatDuration(activity.duration)}
                                                </div>
                                                <div className="text-xs text-gray-500">Duration</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-medium ${activity.score >= 70 ? 'text-green-600' :
                                                    activity.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                    {activity.score}%
                                                </div>
                                                <div className="text-xs text-gray-500">Score</div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {activity.status}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}