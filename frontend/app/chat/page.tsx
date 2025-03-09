"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import LogoutButton from "../components/LogoutButton";
import { ChatInput } from "../components/ChatInput";
import { Preview } from "../components/Preview";
import { chatBubbleType } from "../types/chatBubbleType";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<chatBubbleType[]>([]);

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
            <div className="text-sm mr-4 text-white">
              {session.user?.name || session.user?.email}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-4">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
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
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
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
