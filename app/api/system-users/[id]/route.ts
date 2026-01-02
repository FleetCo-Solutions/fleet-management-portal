import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { db } from '@/app/db'
import { systemUsers } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session to verify admin access
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: userId } = await params

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, phone, status } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: firstName, lastName, and email are required' 
        },
        { status: 400 }
      )
    }

    // Update user
    const [updatedUser] = await db
      .update(systemUsers)
      .set({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        status: status || 'active',
        updatedAt: new Date(),
      })
      .where(eq(systemUsers.id, userId))
      .returning({
        id: systemUsers.id,
        firstName: systemUsers.firstName,
        lastName: systemUsers.lastName,
        email: systemUsers.email,
        phone: systemUsers.phone,
        status: systemUsers.status,
        updatedAt: systemUsers.updatedAt,
      })

    if (!updatedUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        status: updatedUser.status,
        updatedAt: updatedUser.updatedAt?.toISOString() || null,
      },
    })
  } catch (error: any) {
    console.error('Error updating system user:', error)
    
    // Check for unique constraint violation (duplicate email)
    if (error.code === '23505' && error.constraint === 'admin_system_users_email_unique') {
      return NextResponse.json(
        { 
          success: false,
          error: 'A user with this email already exists' 
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
