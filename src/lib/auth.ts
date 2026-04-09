import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.status === "DISABLED") return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        // Prevent multi-login by generating a unique session ID per logical session
        const newSessionId = crypto.randomUUID();
        await prisma.user.update({
          where: { id: user.id },
          data: { activeSessionId: newSessionId },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          activeSessionId: newSessionId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.activeSessionId = (user as any).activeSessionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Enforce strict single-device login: verify token's session matches DB.
        const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { activeSessionId: true }
        });

        if (!dbUser || dbUser.activeSessionId !== token.activeSessionId) {
            // Force logout
            (session as any).error = "SessionTerminatedEvent";
        }

        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-pos-key",
  pages: {
    signIn: "/login"
  }
};
