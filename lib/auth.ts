import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        const demoEmails = ["frankie@example.com", "mom@example.com", "parent@example.com"];
        
        if (!demoEmails.includes(credentials.email)) {
          return null;
        }
        
        try {
          // Find or create demo user
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            // Auto-create demo user
            const role = credentials.email === "parent@example.com" ? "PARENT" : "ADMIN";
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split("@")[0],
                role: role,
              },
            });
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
