import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function GET() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8')
        const users = JSON.parse(data)
        return NextResponse.json(users)
    } catch (error) {
        console.error('Error reading users:', error)
        return NextResponse.json([])
    }
}

export async function POST(request: NextRequest) {
    try {
        const userData = await request.json()

        // Read existing users
        let users = []
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8')
            users = JSON.parse(data)
        } catch {
            // File doesn't exist or is empty, start with empty array
        }

        // Check if user already exists
        const existingUserIndex = users.findIndex((user: any) => user.id === userData.id)

        if (existingUserIndex >= 0) {
            // Update existing user
            users[existingUserIndex] = { ...users[existingUserIndex], ...userData }
        } else {
            // Add new user
            users.push(userData)
        }

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving user:', error)
        return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
    }
}