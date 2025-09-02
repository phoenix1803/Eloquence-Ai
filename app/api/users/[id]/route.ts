import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id

        // Read existing users
        let users = []
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8')
            users = JSON.parse(data)
        } catch {
            return NextResponse.json({ success: true }) // File doesn't exist, nothing to delete
        }

        // Filter out the user
        const filteredUsers = users.filter((user: any) => user.id !== userId)

        // Write back to file
        await fs.writeFile(DATA_FILE, JSON.stringify(filteredUsers, null, 2))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}