"use client";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  delay?: string;
}

export default function Testimonial({ quote, author, role, delay = "" }: TestimonialProps) {
  return (
    <div className={`bg-[#2d2d2d] p-6 rounded-lg border border-[#3d3d3d] animate-fade-in ${delay}`}>
      <div className="mb-4 text-[#bb86fc]">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 11L7 14L4 11V4H10V11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 11L17 14L14 11V4H20V11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-gray-300 mb-4 italic">{quote}</p>
      <div>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-gray-400 text-sm">{role}</p>
      </div>
    </div>
  );
} 