'use client'
import React from "react";
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useUser, UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Navbar() {
    const { isSignedIn, user } = useUser()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-white/80 backdrop-blur-md border-b border-gray-200'
                    : 'bg-transparent'
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container-max section-padding">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                        </div>
                        <span className="font-bold text-xl">Eloquence-AI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {isSignedIn ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-black transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/interview"
                                    className="text-gray-700 hover:text-black transition-colors"
                                >
                                    Interview
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                        Hi, {user?.firstName}
                                    </span>
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: 'w-8 h-8',
                                            },
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/sign-in"
                                    className="text-gray-700 hover:text-black transition-colors"
                                >
                                    Login
                                </Link>
                                <Link href="/sign-up" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden py-4 border-t border-gray-200"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {isSignedIn ? (
                            <div className="space-y-4">
                                <Link
                                    href="/dashboard"
                                    className="block text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/interview"
                                    className="block text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Interview
                                </Link>
                                <div className="flex items-center space-x-3 pt-2">
                                    <UserButton />
                                    <span className="text-sm text-gray-600">
                                        Hi, {user?.firstName}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Link
                                    href="/sign-in"
                                    className="block text-gray-700 hover:text-black transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="block btn-primary text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.nav>
    )
}