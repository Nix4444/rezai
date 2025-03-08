"use client";

interface StepProps {
  number: string;
  title: string;
  description: string;
  delay?: string;
}

function Step({ number, title, description, delay = "" }: StepProps) {
  return (
    <div className={`flex items-start animate-fade-in ${delay}`}>
      <div className="bg-[#64ffda] text-[#212121] w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-heading text-center mx-auto mb-16">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <Step
            number="1"
            title="Chat with our AI"
            description="Simply have a conversation with our AI assistant. Tell it about your experience, skills, and the job you're applying for."
            delay="delay-100"
          />
          <Step
            number="2"
            title="Review & Edit"
            description="Our AI instantly generates a professional resume based on your conversation. Review and make any adjustments needed."
            delay="delay-200"
          />
          <Step
            number="3"
            title="Download & Apply"
            description="Export your polished resume in PDF, Word, or other formats. Start applying for jobs with confidence."
            delay="delay-300"
          />
        </div>
      </div>
    </div>
  );
} 