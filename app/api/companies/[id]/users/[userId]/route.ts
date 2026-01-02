import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { db } from '@/app/db'
import { users } from '@/app/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

// Remove a user from a company (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId, userId } = await params

    // Soft delete the user by setting deletedAt timestamp
    const [removed] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.id, userId),
          isNull(users.deletedAt)
        )
      )
      .returning()

    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from company successfully',
    })
  } catch (error) {
    console.error('Error removing user from company:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove user from company',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
