"use client";

export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="text-[#64ffda] mr-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 7H7V17H9V7Z"
            fill="currentColor"
          />
          <path
            d="M15 7C13.3431 7 12 8.34315 12 10V14C12 15.6569 13.3431 17 15 17C16.6569 17 18 15.6569 18 14V10C18 8.34315 16.6569 7 15 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold">RezAI</span>
    </div>
  );
} 