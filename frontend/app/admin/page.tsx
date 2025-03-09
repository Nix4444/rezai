"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Extra client-side protection - redirect if not admin
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">Manage users and their permissions</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            View Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Content Management</h2>
          <p className="text-gray-600 mb-4">Manage website content and settings</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Edit Content
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <p className="text-gray-600 mb-4">View site usage and user statistics</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            View Reports
          </button>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Admin Information</h2>
        <p className="mb-2">
          <span className="font-medium">Email:</span> {session?.user?.email}
        </p>
        <p className="mb-2">
          <span className="font-medium">Role:</span> {session?.user?.role}
        </p>
      </div>
    </div>
  );
} 