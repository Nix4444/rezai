"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#212121]">
      <header className="bg-[#212121] text-white shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <nav>
            <ul className="flex space-x-6">
              <li 
                className="hover:text-blue-200 cursor-pointer" 
                onClick={() => router.push("/chat")}
              >
                Chat
              </li>
              <li 
                className="hover:text-blue-200 cursor-pointer" 
                onClick={handleSignOut}
              >
                Sign Out
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 