import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
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
        username: { label: "Username", type: "text", placeholder: "johndoe" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials", { username: !!credentials?.username, password: !!credentials?.password });
          return null;
        }

        try {
          console.log("Attempting login for username:", credentials.username);
          
          // Find user by username using raw query
          const users = await prisma.$queryRaw`
            SELECT * FROM "User" WHERE "username" = ${credentials.username as string}
          `;
          
          // Check if user exists
          if (!users || (users as any[]).length === 0) {
            console.log("User not found for username:", credentials.username);
            return null;
          }
          
          const user = (users as any[])[0];
          console.log("User found:", { id: user.id, username: user.username, hasPassword: !!user.password });

          // If user not found or no password
          if (!user || !user.password) {
            console.log("User exists but has no password");
            return null;
          }

          // Compare passwords
          const passwordMatch = await bcrypt.compare(
            credentials.password as string, 
            user.password
          );
          
          console.log("Password match result:", passwordMatch);
          
          if (passwordMatch) {
            // Return a sanitized user object
            return {
              id: user.id,
              email: user.email,
              username: user.username,
              role: user.role
            };
          }
          
          console.log("Password did not match");
          return null;
        } catch (error) {
          console.error("Error in authorize:", error);
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
      // When signing in for the first time, user object is available
      if (user) {
        const extUser = user as ExtendedUser;
        console.log("JWT callback with user:", { 
          id: extUser.id, 
          username: extUser.username || 'none', 
          role: extUser.role || 'none' 
        });
        
        token.userId = extUser.id;
        
        // Add username and role from user to token
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
          console.log("Updated token from DB:", { username: dbUser.username, role: dbUser.role });
        }
      }
      
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // Use data from token instead of fetching from DB again
        session.user.id = token.userId as string;
        
        // Add custom properties to session with type safety
        const user = session.user as any;
        user.username = token.username as string;
        user.role = token.role as string;
        
        console.log("Session callback:", { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        });
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        const userEmail = user.email;
        console.log("Sign in callback for:", { email: userEmail, provider: account?.provider });
        
        // Check if user exists by email using raw query
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
          
          // Generate a new UUID
          const userId = uuidv4();
          const now = new Date();
          
          console.log("Creating new user from Google OAuth:", { email: userEmail, username });
          
          // Create new user with raw query
          await prisma.$executeRaw`
            INSERT INTO "User" (
              "id", "email", "username", "password", "role", 
              "basic_details", "education", "work_experience", 
              "skills", "certifications", "projects", 
              "extracurricular", "position_of_responsibility",
              "createdAt", "updatedAt"
            ) 
            VALUES (
              ${userId}, ${userEmail}, ${username}, ${hashedPassword}, 'USER',
              '', '', '',
              '', '', '',
              '', '',
              ${now}, ${now}
            )
          `;
          
          console.log("Google user created successfully");
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