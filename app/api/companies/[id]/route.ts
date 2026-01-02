import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { companies } from "@/app/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), isNull(companies.deletedAt)));

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch company",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if company exists
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), isNull(companies.deletedAt)));

    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
        },
        { status: 404 }
      );
    }

    // Update company
    const [updatedCompany] = await db
      .update(companies)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update company",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete - set deletedAt timestamp
    const [deletedCompany] = await db
      .update(companies)
      .set({
        deletedAt: new Date(),
        status: "suspended",
      })
      .where(and(eq(companies.id, id), isNull(companies.deletedAt)))
      .returning();

    if (!deletedCompany) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete company",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
