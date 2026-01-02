import { db } from "@/app/db";
import { passwordResetOtps, systemUsers } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.query.systemUsers.findFirst({
      where: eq(systemUsers.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database (userId not needed for admin users)
    await db.insert(passwordResetOtps).values({
      email: email,
      otp: otp,
      expiresAt: expiresAt,
      verified: false,
    });

    // Send OTP via email
    try {
      await resend.emails.send({
        from: "FleetCo <onboarding@resend.dev>",
        to: email,
        subject: "Password Reset OTP - FleetCo Admin",
        html: `
  <div style="background-color:#f6f8fa; padding:40px 0; font-family:Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.05); overflow:hidden;">
      
      <!-- Header -->
      <div style="background:linear-gradient(to right, #004953, #004953); padding:24px; text-align:center;">
        <div style="display:inline-block; width:56px; height:56px; background:white; border-radius:12px; line-height:56px;">
          <span style="font-weight:800; font-size:24px; color:#004953;">FC</span>
        </div>
        <h1 style="margin:16px 0 0; color:white; font-size:24px; font-weight:700;">FleetCo Admin Portal</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="margin:0 0 16px; color:#374151; font-size:16px;">
          Hi ${user.firstName} ${user.lastName},
        </p>
        <p style="color:#374151; line-height:1.6; margin-bottom:24px;">
          We received a request to reset your password for the FleetCo Admin Portal. Use the OTP code below to complete the process:
        </p>

        <!-- OTP Display -->
        <div style="margin:32px 0; padding:24px; background:linear-gradient(135deg, #004953 0%, #006b7a 100%); border-radius:12px; text-align:center;">
          <p style="margin:0 0 8px; color:rgba(255,255,255,0.9); font-size:14px; font-weight:500; letter-spacing:1px;">YOUR OTP CODE</p>
          <div style="font-size:42px; font-weight:700; color:white; letter-spacing:8px; font-family:'Courier New', monospace;">
            ${otp}
          </div>
          <p style="margin:12px 0 0; color:rgba(255,255,255,0.8); font-size:13px;">
            This code expires in 10 minutes
          </p>
        </div>

        <div style="background-color:#fef3c7; border-left:4px solid #f59e0b; padding:16px; border-radius:8px; margin:24px 0;">
          <p style="margin:0; color:#92400e; font-size:14px; line-height:1.5;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately.
          </p>
        </div>

        <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e5e7eb;">
          <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.5;">
            This is an automated message from FleetCo Admin Portal. Please do not reply to this email.
          </p>
          <p style="margin:12px 0 0; color:#6b7280; font-size:13px;">
            © ${new Date().getFullYear()} FleetCo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
        `,
      });
      console.log("✅ OTP email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // Continue anyway - OTP is saved in database
    }

    return NextResponse.json({
      message: "OTP sent successfully to your email",
      success: true,
    });
  } catch (error) {
    console.error("Forget password error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
