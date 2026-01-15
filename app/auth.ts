import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import API_ENDPOINTS from "@/lib/api-endpoints";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solutions.fleetcotelematics.com';

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
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new BackendAuthError("Provide email and password");
        }

        try {
          // Call external login API
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
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
          // Response structure: { success: true, token: "...", user: { ... } }
          const apiUser = result.user || result.data; // Fallback to data just in case, but user is primary
          const token = result.token;

          if (!apiUser || !token) {
            console.error("Login response missing user or token:", result);
            throw new BackendAuthError("Invalid response from server");
          }

          // Return user object with token (This matches the User interface in types/next-auth.d.ts)
          return {
            id: apiUser.id,
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            role: apiUser.role,
            department: apiUser.department,
            accessToken: token, // Store API token
            // Status is not present in the new API response, so we omit it
          };
        } catch (error: any) {
          if (error instanceof BackendAuthError) {
            throw error;
          }
          console.error("Auth error:", error);
          throw new BackendAuthError(
            error.message || "Authentication failed"
          );
        }
      },
    }),
  ],

  callbacks: {
    // Keep user object on the token for session callback
    jwt: async ({ token, user }) => {
      if (user) {
        // Attach the user object returned from `authorize` onto the token
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Expose the user object on the session for client usage
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
});
