"use server";

export interface ICompany {
  id: string;
  name: string;
  domain: string;
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/companies`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch companies");
    }

    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

// Get company by ID
export async function getCompanyById(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/companies/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch company");
    }

    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

// Create new company
export async function createCompany(companyData: ICreateCompany) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/companies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create company");
    }

    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

// Update company
export async function updateCompany(id: string, companyData: IUpdateCompany) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/companies/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update company");
    }

    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

// Delete company
export async function deleteCompany(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/companies/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete company");
    }

    return result;
  } catch (err) {
    throw new Error((err as Error).message);
  }
}
