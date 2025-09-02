'use client'

import { SignIn } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="min-h-screen pt-16 flex items-center justify-center section-padding bg-gray-50">
            <div className="max-w-md w-full">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to continue your interview preparation
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    'bg-black hover:bg-gray-800 text-sm normal-case',
                                card: 'shadow-none border border-gray-200',
                                headerTitle: 'hidden',
                                headerSubtitle: 'hidden',
                                socialButtonsBlockButton:
                                    'border border-gray-200 hover:bg-gray-50',
                                socialButtonsBlockButtonText: 'text-gray-700',
                                formFieldInput:
                                    'border border-gray-200 focus:border-black focus:ring-black',
                                footerActionLink: 'text-black hover:text-gray-800',
                            },
                        }}
                    />
                </motion.div>

                <motion.div
                    className="text-center mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href="/sign-up"
                            className="text-black font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}