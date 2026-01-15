import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import API_ENDPOINTS from "@/lib/api-endpoints";

/**
 * Robustly join base URL and endpoint to avoid double slashes or missing slashes
 */
function joinUrl(base: string, endpoint: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${normalizedEndpoint}`;
}

const API_BASE_URL = process.env.API_BASE_URL || 'https://solutions.fleetcotelematics.com';

// Simple backend auth error class
class BackendAuthError extends CredentialsSignin {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new BackendAuthError("Provide email and password");
        }

        try {
          const loginUrl = joinUrl(API_BASE_URL, API_ENDPOINTS.AUTH.LOGIN);

          // console.log("Attempting login at:", loginUrl);

          // Call external login API
          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new BackendAuthError(
              result.message || result.error || "Invalid credentials"
            );
          }

          // Extract user data from API response
          const apiUser = result.user || result.data;
          const token = result.token;

          if (!apiUser || !token) {
            console.error("Login response missing user or token:", result);
            throw new BackendAuthError("Invalid response from server");
          }

          // Return user object with token
          return {
            id: apiUser.id,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            role: apiUser.role,
            department: apiUser.department,
            accessToken: token,
          };
        } catch (error: any) {
          if (error instanceof BackendAuthError) {
            throw error;
          }
          console.error("Auth error:", error);
          throw new BackendAuthError(
            "Authentication failed. Please verify your connection."
          );
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
});
