"use server";

import { apiClient } from "@/lib/api-client";
import API_ENDPOINTS from "@/lib/api-endpoints";
import { auth } from "@/app/auth";

export interface ISystemUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "super_admin" | "admin" | "support" | "sales" | "billing";
    department?: string;
    status: "active" | "inactive" | "suspended";
    phone?: string;
    avatar?: string;
    lastLogin?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ICreateSystemUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "super_admin" | "admin" | "support" | "sales" | "billing";
    department?: string;
    phone?: string;
}

export interface IUpdateSystemUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: "super_admin" | "admin" | "support" | "sales" | "billing";
    department?: string;
    status?: "active" | "inactive" | "suspended";
    phone?: string;
}

// Helper to get auth token
async function getAuthToken() {
    const session = await auth();
    // Debug logging to verify session structure
    // console.log("Current Session:", JSON.stringify(session, null, 2)); 

    const token = (session?.user as any)?.accessToken;
    if (!token) {
        console.error("Session missing accessToken. User:", session?.user);
        throw new Error("Unauthorized - No auth token available. Please try logging out and logging in again.");
    }
    return token;
}

// Get all system users
export async function getSystemUsers() {
    try {
        const token = await getAuthToken();
        const result = await apiClient.get<{
            success: boolean;
            data: ISystemUser[];
            count?: number;
        }>(API_ENDPOINTS.USERS.SYSTEM_USERS, { token });

        return result;
    } catch (err: any) {
        throw new Error(err.message || "Failed to fetch system users");
    }
}

// Get users by company ID
export async function getUsersByCompanyId(companyId: string) {
    try {
        const token = await getAuthToken();
        const result = await apiClient.get<{
            success: boolean;
            data: any[];
            count?: number;
        }>(`${API_ENDPOINTS.USERS.BY_COMPANY}?companyId=${companyId}`, { token });

        return result;
    } catch (err: any) {
        throw new Error(err.message || "Failed to fetch users");
    }
}

// Create new admin user
export async function createAdminUser(userData: ICreateSystemUser) {
    try {
        const token = await getAuthToken();
        const result = await apiClient.post<{
            success: boolean;
            message: string;
            systemUser: ISystemUser[];
            data?: ISystemUser; // Keeping for backward compat if needed
        }>(API_ENDPOINTS.AUTH.CREATE_ADMIN, {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            phone: userData.phone
            // Intentionally omitting status, role, department if not supported by API schema
        }, { token });

        return result;
    } catch (err: any) {
        throw new Error(err.message || "Failed to create admin user");
    }
}

// Update system user
export async function updateSystemUser(
    id: string,
    userData: IUpdateSystemUser
) {
    try {
        const token = await getAuthToken();
        const result = await apiClient.put<{
            success: boolean;
            message: string;
            data: ISystemUser;
        }>(API_ENDPOINTS.USERS.UPDATE(id), userData, { token });

        return result;
    } catch (err: any) {
        throw new Error(err.message || "Failed to update user");
    }
}

// Delete system user
export async function deleteSystemUser(id: string) {
    try {
        const token = await getAuthToken();
        const result = await apiClient.delete<{
            success: boolean;
            message: string;
        }>(API_ENDPOINTS.USERS.DELETE(id), { token });

        return result;
    } catch (err: any) {
        throw new Error(err.message || "Failed to delete user");
    }
}
