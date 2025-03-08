"use client";

import { signIn } from "next-auth/react";

interface LoginButtonProps {
  provider: "google" | "email";
  children: React.ReactNode;
  className?: string;
}

export default function LoginButton({
  provider,
  children,
  className = "",
}: LoginButtonProps) {
  const handleLogin = () => {
    if (provider === "google") {
      signIn("google", { callbackUrl: "/chat" });
    }
    // Handle email login if implemented
  };

  return (
    <button
      onClick={handleLogin}
      className={`flex items-center justify-center rounded-md py-3 px-4 font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );
} 