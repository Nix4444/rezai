// Type declarations for next-auth
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
}

declare module "next-auth/providers/google" {
  function GoogleProvider(options: {
    clientId: string;
    clientSecret: string;
    [key: string]: any;
  }): any;
  
  export default GoogleProvider;
}
