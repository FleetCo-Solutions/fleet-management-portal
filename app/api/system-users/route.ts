import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { db } from '@/app/db'
import { systemUsers } from '@/app/db/schema'
import { sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Get session to verify admin access
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all system users
    const users = await db
      .select({
        id: systemUsers.id,
        firstName: systemUsers.firstName,
        lastName: systemUsers.lastName,
        email: systemUsers.email,
        role: systemUsers.role,
        department: systemUsers.department,
        status: systemUsers.status,
        phone: systemUsers.phone,
        avatar: systemUsers.avatar,
        permissions: systemUsers.permissions,
        lastLogin: systemUsers.lastLogin,
        createdAt: systemUsers.createdAt,
        updatedAt: systemUsers.updatedAt,
      })
      .from(systemUsers)
      .where(sql`${systemUsers.deletedAt} IS NULL`)
      .orderBy(systemUsers.createdAt)

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department || 'N/A',
      status: user.status,
      phone: user.phone,
      avatar: user.avatar,
      permissions: user.permissions ? JSON.parse(user.permissions) : [],
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || null,
    }))

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      total: transformedUsers.length,
    })
  } catch (error) {
    console.error('Error fetching system users:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch system users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session to verify admin access
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { firstName, lastName, email, password, phone, status } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: firstName, lastName, email, and password are required' 
        },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert new user
    const [newUser] = await db
      .insert(systemUsers)
      .values({
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role: 'support', // Default role
        department: null,
        phone: phone || null,
        status: status || 'active',
        permissions: '[]', // Empty permissions array by default
      })
      .returning({
        id: systemUsers.id,
        firstName: systemUsers.firstName,
        lastName: systemUsers.lastName,
        email: systemUsers.email,
        role: systemUsers.role,
        department: systemUsers.department,
        status: systemUsers.status,
        phone: systemUsers.phone,
        createdAt: systemUsers.createdAt,
      })

    return NextResponse.json({
      success: true,
      message: 'System user created successfully',
      data: {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
        phone: newUser.phone,
        createdAt: newUser.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error creating system user:', error)
    
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
        error: 'Failed to create system user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
