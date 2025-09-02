'use client'

import React from "react";

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

interface UserData {
    id: string
    email: string
    firstName: string
    lastName: string
    imageUrl: string
    createdAt: string
}

interface UserContextType {
    userData: UserData | null
    isLoading: boolean
    saveUserData: (data: UserData) => Promise<void>
    clearUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isLoaded && user) {
            const data: UserData = {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                imageUrl: user.imageUrl,
                createdAt: new Date().toISOString(),
            }
            saveUserData(data)
        } else if (isLoaded && !user) {
            setUserData(null)
            setIsLoading(false)
        }
    }, [user, isLoaded])

    const saveUserData = async (data: UserData) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (response.ok) {
                setUserData(data)
            }
        } catch (error) {
            console.error('Failed to save user data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const clearUserData = async () => {
        if (!userData) return

        try {
            await fetch(`/api/users/${userData.id}`, {
                method: 'DELETE',
            })
            setUserData(null)
        } catch (error) {
            console.error('Failed to clear user data:', error)
        }
    }

    return (
        <UserContext.Provider
            value={{ userData, isLoading, saveUserData, clearUserData }}
        >
            {children}
        </UserContext.Provider>
    )
}

export function useUserContext() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider')
    }
    return context
}