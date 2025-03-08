"use client";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}

export default function FeatureCard({ icon, title, description, delay = "" }: FeatureCardProps) {
  return (
    <div className={`feature-card animate-fade-in ${delay}`}>
      <div className="text-[#64ffda] mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
} 