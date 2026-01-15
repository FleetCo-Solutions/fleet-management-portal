/**
 * API Client for FleetCo External APIs
 * Base URL: https://solutions.fleetcotelematics.com
 */

const API_BASE_URL = process.env.API_BASE_URL || 'https://solutions.fleetcotelematics.com';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    error?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get authorization token from session storage or cookies
     * Can also accept token as parameter for server-side requests
     */
    private getAuthToken(providedToken?: string): string | null {
        // If token is provided (from server-side session), use it
        if (providedToken) {
            return providedToken;
        }

        // Client-side: try to get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            return token;
        }

        return null;
    }

    /**
     * Make an authenticated API request
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit & { token?: string } = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const { token: providedToken, ...fetchOptions } = options;
        const token = this.getAuthToken(providedToken);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add existing headers from options
        if (fetchOptions.headers) {
            const existingHeaders = new Headers(fetchOptions.headers);
            existingHeaders.forEach((value, key) => {
                headers[key] = value;
            });
        }

        // Add authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            let data: any;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw {
                    message: data.message || data.error || 'Request failed',
                    status: response.status,
                    error: data,
                } as ApiError;
            }

            return data as T;
        } catch (error) {
            if ((error as ApiError).status) {
                throw error;
            }

            throw {
                message: (error as Error).message || 'Network error',
                status: 0,
                error: error,
            } as ApiError;
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: RequestInit & { token?: string }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: any, options?: RequestInit & { token?: string }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: any, options?: RequestInit & { token?: string }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: RequestInit & { token?: string }): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }

    /**
     * Set authentication token
     */
    setAuthToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    /**
     * Clear authentication token
     */
    clearAuthToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;
