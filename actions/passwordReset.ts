"use server";

import { db } from "@/app/db";
import { systemUsers } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map<
  string,
  { otp: string; expiresAt: number; verified: boolean }
>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestPasswordReset(email: string) {
  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.email, email))
      .limit(1);

    if (!user) {
      throw new Error("No account found with this email address");
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expiresAt, verified: false });

    // Send OTP via email
    try {
      await resend.emails.send({
        from: "FleetCo <onboarding@resend.dev>",
        to: email,
        subject: "Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #004953;">Password Reset Request</h2>
            <p>You requested to reset your password for FleetCo Admin Portal.</p>
            <p>Your OTP code is:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              © ${new Date().getFullYear()} FleetCo. All rights reserved.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Still return success to avoid information disclosure
    }

    return { success: true, message: "OTP sent to your email" };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function verifyOtp(email: string, otp: string) {
  try {
    const stored = otpStore.get(email);

    if (!stored) {
      throw new Error("No OTP found. Please request a new one.");
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      throw new Error("OTP has expired. Please request a new one.");
    }

    if (stored.otp !== otp) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // Mark as verified
    otpStore.set(email, { ...stored, verified: true });

    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function resetPassword(email: string, newPassword: string) {
  try {
    const stored = otpStore.get(email);

    if (!stored || !stored.verified) {
      throw new Error("Please verify OTP first");
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      throw new Error("Session expired. Please start over.");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db
      .update(systemUsers)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(systemUsers.email, email));

    // Clear OTP
    otpStore.delete(email);

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
