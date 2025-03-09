// Type declarations for next-auth
import "next-auth";
import "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface NextAuthConfig {
    providers: any[];
    pages?: {
      signIn?: string;
      [key: string]: string | undefined;
    };
    [key: string]: any;
  }
  
  function NextAuth(config: NextAuthConfig): {
    handlers: {
      GET: any;
      POST: any;
    };
    auth: any;
    signIn: any;
    signOut: any;
  };
  
  export default NextAuth;
  export type { NextAuthConfig };

  interface User {
    id: string;
    email: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
  }
}

declare module "next-auth/providers/google" {
  function GoogleProvider(options: {
    clientId: string;
    clientSecret: string;
    [key: string]: any;
  }): any;
  
  export default GoogleProvider;
}
