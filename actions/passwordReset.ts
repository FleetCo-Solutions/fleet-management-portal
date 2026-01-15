"use server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solutions.fleetcotelematics.com';

export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/forgetPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send OTP");
    }

    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function verifyOtp(email: string, otp: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/verifyOtp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to verify OTP");
    }

    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function resetPassword(email: string, newPassword: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/changePassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to reset password");
    }

    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}
