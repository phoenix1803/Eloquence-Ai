'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Play, Users, Zap } from 'lucide-react'
import AnimatedSection from '../components/ui/AnimatedSection'
import React from "react";

export default function HomePage() {
    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="section-padding py-20 lg:py-32">
                <div className="container-max">
                    <motion.div
                        className="text-center max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Master Your Interviews with{' '}
                            <span className="text-black">AI-Powered</span> Practice
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Get real-time feedback, practice with industry-specific questions,
                            and build confidence for your next big opportunity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/sign-up" className="btn-primary inline-flex items-center">
                                Start Practicing Free
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                            <button className="btn-secondary inline-flex items-center">
                                <Play className="mr-2 w-4 h-4" />
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <AnimatedSection className="section-padding py-20 bg-gray-50">
                <div className="container-max">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose InterviewAI?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our AI-powered platform provides everything you need to ace your
                            next interview.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="card text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* How It Works Section */}
            <AnimatedSection className="section-padding py-20">
                <div className="container-max">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get started in minutes and see immediate improvements in your
                            interview performance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                className="text-center"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                            >
                                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* CTA Section */}
            <AnimatedSection className="section-padding py-20 bg-black text-white">
                <div className="container-max text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                        Ready to Ace Your Next Interview?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who have improved their interview
                        skills with InterviewAI.
                    </p>
                    <Link
                        href="/sign-up"
                        className="bg-white text-black px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 inline-flex items-center"
                    >
                        Get Started Today
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </AnimatedSection>
        </div>
    )
}

const features = [
    {
        icon: Zap,
        title: 'Real-time Feedback',
        description:
            'Get instant analysis of your responses with actionable improvement suggestions.',
    },
    {
        icon: Users,
        title: 'Industry-Specific Questions',
        description:
            'Practice with questions tailored to your field and experience level.',
    },
    {
        icon: CheckCircle,
        title: 'Progress Tracking',
        description:
            'Monitor your improvement over time with detailed performance analytics.',
    },
]

const steps = [
    {
        title: 'Sign Up',
        description: 'Create your account and tell us about your career goals.',
    },
    {
        title: 'Practice',
        description: 'Start practicing with AI-generated questions and scenarios.',
    },
    {
        title: 'Improve',
        description: 'Review feedback and track your progress over time.',
    },
]