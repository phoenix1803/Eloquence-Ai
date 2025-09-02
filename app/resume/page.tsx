'use client'

import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { FileText, Upload } from 'lucide-react'

export default function ResumePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen pt-16 bg-gray-50">
                <div className="section-padding py-12">
                    <div className="container-max">
                        <motion.div
                            className="text-center max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Resume Analysis
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                This feature is coming soon! Upload your resume to get AI-powered
                                feedback and improvement suggestions.
                            </p>
                            <div className="card p-8">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">
                                        Drag and drop your resume here
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supported formats: PDF, DOC, DOCX
                                    </p>
                                    <button className="btn-primary mt-4" disabled>
                                        Choose File
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}