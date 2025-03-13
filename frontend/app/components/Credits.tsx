"use client";
interface CreditsProps {
  balance: number;
}
export default function Credits({ balance }: CreditsProps) {
  return (
    <button
      className="text-sm text-white-600 cursor-pointer p-4"
    >
      Credits: { balance }
    </button>
  );
}
