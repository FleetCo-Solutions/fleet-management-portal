import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

// Get all users from the fleetmanagement project's users table
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all users from the shared database
    const allUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        status: users.status,
      })
      .from(users)
      .where(eq(users.status, 'active'))

    return NextResponse.json({
      success: true,
      data: allUsers,
      count: allUsers.length,
    })
  } catch (error) {
    console.error('Error fetching fleet users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
