"use client";

export default function DemoChat() {
  return (
    <div className="bg-[#2d2d2d] rounded-xl shadow-lg p-6 max-w-xl w-full border border-[#3d3d3d]">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-full bg-[#3d3d3d] flex items-center justify-center mr-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-300">
          Create a professional resume for a software developer position.
        </p>
      </div>

      <div className="ml-11 mt-6">
        <p className="text-sm text-gray-300 mb-4">I'd be happy to help you create a professional resume. Let's start with your basic information and experience.</p>

        <div className="bg-[#393939] rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-[#64ffda]">Professional Resume</h3>
          
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2 text-white">John Doe</h4>
            <p className="text-sm text-gray-300 mb-1">Software Developer</p>
            <p className="text-xs text-gray-400 mb-3">john.doe@example.com | (555) 123-4567 | San Francisco, CA</p>
            <div className="w-full h-px bg-[#4d4d4d] my-3"></div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-[#bb86fc]">SUMMARY</h4>
            <p className="text-xs text-gray-300">
              Experienced software developer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud infrastructure. Proven track record of delivering scalable applications and optimizing performance.
            </p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-[#bb86fc]">EXPERIENCE</h4>
            <div className="mb-2">
              <p className="text-xs font-medium text-white">Senior Software Developer | TechCorp Inc.</p>
              <p className="text-xs text-gray-400">Jan 2020 - Present</p>
              <ul className="list-disc pl-4 mt-1">
                <li className="text-xs text-gray-300">Led development of customer-facing web application with 100K+ monthly users</li>
                <li className="text-xs text-gray-300">Improved application performance by 40% through code optimization</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-[#bb86fc]">SKILLS</h4>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-[#4d4d4d] px-2 py-1 rounded">JavaScript</span>
              <span className="text-xs bg-[#4d4d4d] px-2 py-1 rounded">React</span>
              <span className="text-xs bg-[#4d4d4d] px-2 py-1 rounded">Node.js</span>
              <span className="text-xs bg-[#4d4d4d] px-2 py-1 rounded">TypeScript</span>
              <span className="text-xs bg-[#4d4d4d] px-2 py-1 rounded">AWS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 