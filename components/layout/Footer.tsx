'use client'
import React from "react";

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="container-max section-padding py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AI</span>
                            </div>
                            <span className="font-bold text-xl">Eloquence-AI</span>
                        </Link>
                        <p className="text-gray-600 max-w-md">
                            Master your interviews with AI-powered practice sessions and
                            real-time feedback.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/features"
                                    className="text-gray-600 hover:text-black transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="text-gray-600 hover:text-black transition-colors"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/interview"
                                    className="text-gray-600 hover:text-black transition-colors"
                                >
                                    Interview Practice
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-600 hover:text-black transition-colors"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-600 hover:text-black transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-600 hover:text-black transition-colors"
                                >
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <motion.div
                    className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <p>&copy; 2024 InterviewAI. All rights reserved.</p>
                </motion.div>
            </div>
        </footer>
    )
}