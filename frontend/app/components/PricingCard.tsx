"use client";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  delay?: string;
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  isPopular = false,
  delay = "",
}: PricingCardProps) {
  return (
    <div
      className={`relative bg-[#2d2d2d] p-6 rounded-lg border ${
        isPopular ? "border-[#64ffda]" : "border-[#3d3d3d]"
      } animate-fade-in ${delay}`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-[#64ffda] text-[#212121] text-xs font-bold py-1 px-3 rounded-full">
          Popular
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== "Free" && <span className="text-gray-400 ml-1">/month</span>}
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="mb-6 space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <span className="text-[#64ffda] mr-2">✓</span>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-2 px-4 rounded-md transition-colors ${
          isPopular
            ? "bg-[#64ffda] text-[#212121] hover:bg-[#4fd1b3]"
            : "bg-[#3d3d3d] text-white hover:bg-[#4d4d4d]"
        }`}
      >
        Get Started
      </button>
    </div>
  );
} 