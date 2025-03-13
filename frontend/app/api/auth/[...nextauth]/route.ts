import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/database";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Prisma, User, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

// Extended user type with the properties we're adding
type ExtendedUser = {
  id: string;
  email: string;
  username?: string;
  role?: Role;
  [key: string]: any;
};

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Username & Password",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Avi Singh" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          
          const users = await prisma.$queryRaw`
            SELECT * FROM "User" WHERE "username" = ${credentials.username as string}
          `;
          
          if (!users || (users as any[]).length === 0) {
            return null;
          }
          
          const user = (users as any[])[0];

          // If user not found or no password
          if (!user || !user.password) {
            return null;
          }

          try {
            const passwordMatch = await bcrypt.compare(
              credentials.password as string, 
              user.password
            );
            
            
            if (passwordMatch) {
              return {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
              };
            }
                        return null;
          } catch (passwordError) {
            return null;
          }
        } catch (error) {
          return null;
        }
      }
    })
  ],
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extUser = user as ExtendedUser;
        
        
        token.userId = extUser.id;
        
        
        if (extUser.role) {
          token.role = extUser.role;
        }
        if (extUser.username) {
          token.username = extUser.username;
        }
      }
      
      // Fetch user from database on subsequent requests if needed
      if (token.email && !token.role) {
        // Use raw query to get user by email
        const users = await prisma.$queryRaw`
          SELECT * FROM "User" WHERE "email" = ${token.email as string}
        `;
        
        if (users && (users as any[]).length > 0) {
          const dbUser = (users as any[])[0];
          token.userId = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.userId as string;
        
        
        const user = session.user as any;
        user.username = token.username as string;
        user.role = token.role as string;
        
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        const userEmail = user.email;
        
        const users = await prisma.$queryRaw`
          SELECT * FROM "User" WHERE "email" = ${userEmail}
        `;
        
        const existingUser = users && (users as any[]).length > 0 ? (users as any[])[0] : null;
        
        // For Google auth user
        if (!existingUser && account?.provider === "google") {
          // Generate a random secure password and username
          const randomPassword = Math.random().toString(36).slice(-10);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          // Create username from email (before the @ symbol)
          let username = userEmail.split('@')[0];
          
          // Check if username exists using raw query
          const usernameCheck = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM "User" WHERE "username" = ${username}
          `;
          
          // If username exists, add random digits
          if ((usernameCheck as any[])[0].count > 0) {
            username = `${username}${Math.floor(Math.random() * 1000)}`;
          }

          const userId = user.id;
          const now = new Date();
          
          
          await prisma.$executeRaw`
            INSERT INTO "User" (
              "id", "email", "username", "password", "role", "profile","formatted",
              "createdAt", "updatedAt"
            ) 
            VALUES (
              ${userId}, ${userEmail}, ${username}, ${hashedPassword}, 'USER','','',${now}, ${now}
            )
          `;
          
        }
        
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
  },
};

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };
export const { GET, POST } = handlers;