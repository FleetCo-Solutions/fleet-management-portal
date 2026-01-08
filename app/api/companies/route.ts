import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/app/db";
import { companies, users } from "@/app/db/schema";
import { isNull } from "drizzle-orm";

export async function GET() {
  try {
    // Get session to verify admin access
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all companies that are not deleted
    const allCompanies = await db
      .select()
      .from(companies)
      .where(isNull(companies.deletedAt))
      .orderBy(companies.createdAt);

    return NextResponse.json({
      success: true,
      data: allCompanies,
      count: allCompanies.length,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch companies",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get session to verify admin access
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const {
      name,
      contactPerson,
      contactEmail,
      contactPhone,
      country,
    } = body;

    if (
      !name ||
      !contactPerson ||
      !contactEmail ||
      !contactPhone ||
      !country
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Use a transaction to ensure both company and user are created together or not at all
    const result = await db.transaction(async (tx) => {
      // Create new company
      const [newCompany] = await tx
        .insert(companies)
        .values({
          name,
          status: "trial",
          contactPerson,
          contactEmail,
          contactPhone,
          country,
          address: body.address,
        })
        .returning();

      // Automatically create an admin user for this company
      const defaultPassword = "Welcome@123"; // Default password
      
      // Split contact person name into first and last name
      const nameParts = contactPerson.trim().split(" ");
      const firstName = nameParts[0] || contactPerson;
      const lastName = nameParts.slice(1).join(" ") || contactPerson;

      await tx.insert(users).values({
        companyId: newCompany.id,
        firstName,
        lastName,
        email: contactEmail,
        phone: contactPhone,
        passwordHash: defaultPassword,
        status: "active",
      });

      return { newCompany, defaultPassword };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company and admin user created successfully",
        data: result.newCompany,
        userCredentials: {
          email: contactEmail,
          password: result.defaultPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating company:", error);
    
    // Check for unique constraint violations in the error or its cause
    const errorMessage = error instanceof Error ? error.message : '';
    const causeMessage = (error as any)?.cause?.message || '';
    const constraintName = (error as any)?.cause?.constraint || '';
    
    // Check for duplicate phone number
    if (constraintName === 'users_phone_unique' || 
        errorMessage.includes("users_phone_unique") || 
        causeMessage.includes("users_phone_unique") ||
        (causeMessage.includes("duplicate key") && causeMessage.includes("phone"))) {
      return NextResponse.json(
        {
          success: false,
          message: "This phone number is already registered in the system",
        },
        { status: 409 }
      );
    }
    
    // Check for duplicate email
    if (constraintName === 'users_email_unique' ||
        errorMessage.includes("users_email_unique") || 
        causeMessage.includes("users_email_unique") ||
        (causeMessage.includes("duplicate key") && causeMessage.includes("email"))) {
      return NextResponse.json(
        {
          success: false,
          message: "This email address is already registered in the system",
        },
        { status: 409 }
      );
    }
    
    // Check for duplicate company name
    if (errorMessage.includes("companies") && errorMessage.includes("unique")) {
      return NextResponse.json(
        {
          success: false,
          message: "A company with this name already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create company",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
