/**
 * API Endpoints Configuration
 * Maps to external FleetCo API endpoints
 */

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/api/adminusers/login',
        CREATE_ADMIN: '/api/adminusers',
    },

    // Companies
    COMPANIES: {
        GET_ALL: '/api/company',
        CREATE: '/api/company',
        GET_BY_ID: (id: string) => `/api/company/${id}`,
        UPDATE: (id: string) => `/api/company/${id}`,
        DELETE: (id: string) => `/api/company/${id}`,
    },

    // Users
    USERS: {
        SYSTEM_USERS: '/api/users/systemUsers',
        BY_COMPANY: '/api/users/usersByCompanyId',
        GET_BY_ID: (id: string) => `/api/users/${id}`,
        UPDATE: (id: string) => `/api/users/${id}`,
        DELETE: (id: string) => `/api/users/${id}`,
    },
} as const;

export default API_ENDPOINTS;
