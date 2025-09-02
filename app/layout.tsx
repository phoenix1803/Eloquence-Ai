import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { UserProvider } from '../lib/context/UserContext'
import ConditionalLayout from '../components/layout/ConditionalLayout'
import React from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Eloquence-AI - Master Your Communication',
    description: 'AI-powered interview preparation and communication platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
                variables: {
                    colorPrimary: '#000000',
                    colorBackground: '#ffffff',
                    colorInputBackground: '#ffffff',
                    colorInputText: '#000000',
                },
            }}
        >
            <html lang="en">
                <body className={inter.className}>
                    <UserProvider>
                        <ConditionalLayout>
                            {children}
                        </ConditionalLayout>
                    </UserProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}