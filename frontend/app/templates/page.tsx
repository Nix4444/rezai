'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';
import Credits from '../components/Credits';
import easyresume from '../../public/easyresume.jpeg'; 
import jobswitch from '../../public/jobswitch.jpeg';
import SrsoftwareImage from '../../public/Srsoftwareeng.jpeg';
import one from '../../public/1.jpeg';
import ivleague from '../../public/ivleague.jpeg';
import engineer from '../../public/engineer resume.jpeg';

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);




  const templates = [
    { 
      id: 1, 
      name: "Senior Software Engineer Resume", 
      description: "Clean and modern professional resume template",
      image: SrsoftwareImage
    },
    { 
      id: 2, 
      name: "Easy Resume", 
      description: "Stand out with this creative curriculum vitae design",
      image: easyresume
    },
    { 
      id: 3, 
      name: "Job Switch Resume", 
      description: "Perfect for academic and research positions",
      image: jobswitch
    },
    { 
      id: 4, 
      name: "Minimalist Resume", 
      description: "Highlight your technical skills and projects",
      image: one
    },
    { 
      id: 5, 
      name: "Technical Resume", 
      description: "Simple and elegant minimalist design",
      image: engineer
    },
    { 
      id: 6, 
      name: "IV League Resume", 
      description: "Sophisticated template for executive positions",
      image: ivleague
    },
  ];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const userName = session?.user ? (
    // @ts-ignore - Access name or email property safely
    session.user.name || session.user.email || "User"
  ) : "User";
  
  const userImage = session?.user ? (
    // @ts-ignore - Access image property safely
    session.user.image || null
  ) : null;

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      
      {/* Navbar */}
      <header className="bg-[#212121] shadow-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center">
            <button 
              onClick={() => router.push("/tools")}
              className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded mr-3 cursor-pointer"
            >
              Tools
            </button>
            <button 
              onClick={() => router.push("/templates")}
              className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded mr-3 cursor-pointer"
            >
              Templates
            </button>
            
            <button 
              onClick={() => router.push("/chat")}
              className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded mr-3 cursor-pointer"
            >
              Chat
            </button>
            
            {/* Always show Credits */}
            <Credits balance={3} />
        
            
            

            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Resume Templates
          </h1>
          <p className="text-xl text-center mb-12 text-gray-300">
            Choose from our collection of professionally designed resume templates
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <div 
                key={template.id}
                className="relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="aspect-[8.5/11] bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl border border-gray-700">
                  {/* Template preview image using Next.js Image component */}
                  <div className="w-full h-full relative flex items-center justify-center p-4">
                    <Image
                      src={template.image}
                      alt={template.name}
                      style={{ 
                        objectFit: 'contain',
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      fill={true}
                      priority={index < 3}
                      className="p-4"
                    />
                  </div>
                  
                  {/* Hover overlay with info and download button */}
                  <div className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                    <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                    <p className="text-gray-300 text-center mb-6">{template.description}</p>
                    
                    <div className="flex space-x-4">
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Download template ${template.id}`);
                        }}
                        className="bg-[#64ffda] text-[#212121] font-medium py-2 px-4 rounded-md hover:opacity-90 transition-all duration-300"
                      >
                        Download
                      </a>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Preview template ${template.id}`);
                        }}
                        className="border border-[#64ffda] text-[#64ffda] bg-transparent font-medium py-2 px-4 rounded-md hover:bg-[#64ffda10] transition-all duration-300"
                      >
                        Preview
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Template name visible when not hovering */}
                <h3 className="mt-4 text-lg font-medium">{template.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 