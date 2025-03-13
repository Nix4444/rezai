"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import { ChatInput } from "../components/ChatInput";
import { Preview } from "../components/Preview";
import { chatBubbleType } from "../types/chatBubbleType";
import AtsScore from "../components/AtsScore";
import Credits from "../components/Credits";
import axios from "axios";
import { useAtom } from "jotai";
import { resumeHtmlAtom } from "../components/ChatInput";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<chatBubbleType[]>([]);
  const [, setResumeHtml] = useAtom(resumeHtmlAtom);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Check for existing profile and load HTML when session is available
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (session?.user?.id && !profileLoaded) {
        try {
          // Get the JWT token from the session
          const tokenResponse = await fetch('/api/auth/token');
          const { token } = await tokenResponse.json();
          
          if (!token) {
            console.error('Failed to get token');
            return;
          }
          
          try {

            const htmlResponse = await axios.get('http://localhost:3001/api/generate-resume?checkOnly=true', {
              headers: { 
                Authorization: `Bearer ${token}` 
              },
              withCredentials: true
            });
            
            if (htmlResponse.data) {

              const content = htmlResponse.data;
              const hasContent = content && content.trim() !== '';
              
              if (hasContent) {
                setResumeHtml(content);
                setProfileLoaded(true);
                
                // Add a message indicating the existing resume has been loaded
                setMessages([
                  { type: 'answer', text: 'Welcome back! I\'ve loaded your existing resume. You can see it in the preview panel. Would you like to make any changes to it?', skeleton: false }
                ]);
              } else {
                setProfileLoaded(true);
                setMessages([
                  { type: 'answer', text: 'Let\'s create a resume for you. What kind of role are you looking for?', skeleton: false }
                ]);
              }
            }
          } catch (error) {
            console.error('Error fetching resume HTML:', error);
            if (axios.isAxiosError(error) && error.response) {
              if (error.response.status === 404) {
                setProfileLoaded(true);
                setMessages([
                  { type: 'answer', text: 'Let\'s create a resume for you. What kind of role are you looking for?', skeleton: false }
                ]);
              } else {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
              }
            }

            setProfileLoaded(true);
          }
        } catch (error) {
          console.error('Error in auth token process:', error);
          setProfileLoaded(true);
        }
      }
    }
    
    if (status === "authenticated") {
      loadExistingProfile();
    }
  }, [session, status, setResumeHtml, profileLoaded]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
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
            <Credits balance={3} />
          
            <div className="text-sm mr-4 text-white">
              {(session.user as any)?.name || (session.user as any)?.email}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-4">
              {(session.user as any)?.image ? (
                <img
                  src={(session.user as any).image}
                  alt={(session.user as any).name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full bg-[#212121] flex flex-col">
        <div className="w-full h-full flex-1 flex flex-col">
          
          <div className="flex rounded-lg overflow-hidden shadow-lg flex-1 h-full">

            <div className="w-1/2 bg-[#212121] p-6 border-t border-l border-r border-gray-700 flex flex-col h-full">
              
              {/* Display messages */}
              <div className="flex flex-col space-y-4 flex-1 overflow-y-auto h-full custom-scrollbar pb-20">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start ${msg.type === 'answer' ? '' : 'justify-end'}`}>
                    {msg.type === 'answer' && (
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mr-3 flex-shrink-0">
                        R
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-3 max-w-md ${msg.type === 'answer' ? 'bg-gray-800' : 'bg-gray-700'}`}>
                      <p className="text-white">{msg.text}</p>
                    </div>
                    
                    {msg.type === 'question' && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ml-3 flex-shrink-0">
                        {(session.user as any)?.image ? (
                          <img
                            src={(session.user as any).image}
                            alt={(session.user as any).name || "User"}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-px bg-gray-700"></div>
            
            <div className="w-1/2 bg-[#212121] p-6 border-t border-r border-gray-700 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4 text-white">Preview</h2>
              <div className="rounded-lg p-4 flex-1 text-white overflow-y-auto h-full custom-scrollbar">
                <Preview />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat input component - Fixed at bottom of page, left side only */}
      <div className="fixed bottom-0 left-0 w-1/2 border-l border-r border-gray-700 py-3 px-6">
        <ChatInput messages={messages} setMessages={setMessages} />
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
