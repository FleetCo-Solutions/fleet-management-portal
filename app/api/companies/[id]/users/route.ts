import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

// Get all users for a specific company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params

    // Get all active users for this company from the users table
    const companyUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        status: users.status,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.status, 'active'),
          isNull(users.deletedAt)
        )
      )
      .orderBy(users.firstName)

    return NextResponse.json({
      success: true,
      data: companyUsers,
      count: companyUsers.length,
    })
  } catch (error) {
    console.error('Error fetching company users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
