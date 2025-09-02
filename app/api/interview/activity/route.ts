import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import fs from 'fs/promises'
import path from 'path'

const ACTIVITY_FILE = path.join(process.cwd(), 'data', 'activity.json')

export async function POST(request: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const activityData = await request.json()

        // Read existing activities
        let activities = []
        try {
            const data = await fs.readFile(ACTIVITY_FILE, 'utf8')
            activities = JSON.parse(data)
        } catch {
            // File doesn't exist or is empty, start with empty array
        }

        // Add new activity
        const newActivity = {
            id: Date.now().toString(),
            userId,
            type: activityData.type,
            duration: activityData.duration,
            score: activityData.score,
            timestamp: activityData.timestamp,
            status: 'completed'
        }

        activities.push(newActivity)

        // Write back to file
        await fs.writeFile(ACTIVITY_FILE, JSON.stringify(activities, null, 2))

        return NextResponse.json({ success: true, activity: newActivity })
    } catch (error) {
        console.error('Error logging activity:', error)
        return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Read activities
        let activities = []
        try {
            const data = await fs.readFile(ACTIVITY_FILE, 'utf8')
            activities = JSON.parse(data)
        } catch {
            return NextResponse.json([])
        }

        // Filter activities for current user
        const userActivities = activities
            .filter((activity: any) => activity.userId === userId)
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10) // Get last 10 activities

        return NextResponse.json(userActivities)
    } catch (error) {
        console.error('Error fetching activities:', error)
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }
}