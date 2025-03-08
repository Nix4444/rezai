"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-white-600 hover:text-gray-400 cursor-pointer"
    >
      Sign out
    </button>
  );
} 