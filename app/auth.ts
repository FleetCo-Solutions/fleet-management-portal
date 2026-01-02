import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { systemUsers } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

        // Fetch user from database
        const [user] = await db
          .select()
          .from(systemUsers)
          .where(eq(systemUsers.email, credentials.email as string))
          .limit(1);

        if (!user) {
          throw new BackendAuthError("Invalid credentials");
        }

        // Check if user is active
        if (user.status !== "active") {
          throw new BackendAuthError(
            `Account is ${user.status}. Please contact administrator.`
          );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new BackendAuthError("Invalid credentials");
        }

        // Update last login
        await db
          .update(systemUsers)
          .set({ lastLogin: new Date() })
          .where(eq(systemUsers.id, user.id));

        // Return user object (NextAuth will include this on `user` in callbacks)
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          status: user.status,
          department: user.department,
        };
      },
    }),
  ],

  callbacks: {
    // Keep user object on the token for session callback
    jwt: async ({ token, user }) => {
      if (user) {
        // Attach the user object returned from `authorize` onto the token
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.department = (user as any).department;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Expose the user object on the session for client usage
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).department = token.department;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
});
