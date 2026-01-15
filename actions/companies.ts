"use server";

import { apiClient } from "@/lib/api-client";
import API_ENDPOINTS from "@/lib/api-endpoints";
import { auth } from "@/app/auth";

// Helper to get auth token
async function getAuthToken() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  if (!token) {
    throw new Error("Unauthorized - No auth token available");
  }
  return token;
}

export interface ICompany {
  id: string;
  name: string;
  domain?: string;
  status: "active" | "suspended" | "trial" | "expired";
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  address?: string | null;
  createdAt: string;
  trialExpiresAt?: string | null;
  subscriptionExpiresAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface ICreateCompany {
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  address?: string;
}

export interface IUpdateCompany extends Partial<ICreateCompany> {
  status?: "active" | "suspended" | "trial" | "expired";
}

// Get all companies
export async function getCompanies() {
  try {
    const token = await getAuthToken();
    const result = await apiClient.get<{ success: boolean; data: ICompany[]; count?: number }>(
      API_ENDPOINTS.COMPANIES.GET_ALL,
      { token }
    );

    return result;
  } catch (err: any) {
    throw new Error(err.message || "Failed to fetch companies");
  }
}

// Get company by ID
export async function getCompanyById(id: string) {
  try {
    const token = await getAuthToken();
    const result = await apiClient.get<{ success: boolean; data: ICompany }>(
      API_ENDPOINTS.COMPANIES.GET_BY_ID(id),
      { token }
    );

    return result;
  } catch (err: any) {
    throw new Error(err.message || "Failed to fetch company");
  }
}

// Create new company
export async function createCompany(companyData: ICreateCompany) {
  try {
    const token = await getAuthToken();
    const result = await apiClient.post<{
      success: boolean;
      message: string;
      data: ICompany[];
      userCredentials?: { email: string; password: string };
    }>(API_ENDPOINTS.COMPANIES.CREATE, companyData, { token });

    return result;
  } catch (err: any) {
    throw new Error(err.message || "Failed to create company");
  }
}

// Update company
export async function updateCompany(id: string, companyData: IUpdateCompany) {
  try {
    const token = await getAuthToken();
    const result = await apiClient.put<{
      success: boolean;
      message: string;
      data: ICompany;
    }>(API_ENDPOINTS.COMPANIES.UPDATE(id), companyData, { token });

    return result;
  } catch (err: any) {
    throw new Error(err.message || "Failed to update company");
  }
}

// Delete company
export async function deleteCompany(id: string) {
  try {
    const token = await getAuthToken();
    const result = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(API_ENDPOINTS.COMPANIES.DELETE(id), { token });

    return result;
  } catch (err: any) {
    throw new Error(err.message || "Failed to delete company");
  }
}
