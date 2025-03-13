import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {

  interface User {
    id: string;
    email: string;
    username?: string;
    role?: Role;
  }
  
  
  interface Session {
    user: {
      id: string;
      email: string;
      username?: string;
      role?: Role;
    }
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    username?: string;
    role?: string;
  }
} 