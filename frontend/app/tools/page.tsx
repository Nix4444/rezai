"use client";
import React from 'react';
import AtsScore from '../components/AtsScore';
import { Box, Flex } from '@radix-ui/themes';
import { useSession, signOut } from 'next-auth/react';
import Logo from '../components/Logo';
import Credits from '../components/Credits';
import LogoutButton from '../components/LogoutButton';

export default function AtsScorePage() {
    const { data: session, status } = useSession();

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
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] text-white">
            {/* Navigation bar */}
            <header className="bg-[#212121] shadow-sm border-b border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Logo />
                    <div className="flex items-center">
                        <button 
                            onClick={() => window.location.href = "/chat"}
                            className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded mr-3 cursor-pointer"
                        >
                            Chat
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
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-sm text-white hover:text-gray-400 cursor-pointer"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="p-4">
                <div className="max-w-7xl mx-auto">
                <Box className="py-6">
                    <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        AI-Powered Job Application Suite
                    </h1>
                    <p className="text-gray-400 mb-4">
                        Analyze your resume with ATS scoring, get AI-driven coaching, and generate tailored cover letters effortlessly.
                    </p>
                </Box>
                    
                    <Box className="bg-[#202020] rounded-xl p-5 border border-gray-800 shadow-lg mb-6">
                        <h2 className="text-xl font-semibold mb-3 text-gray-200">Tips to increases your chances of getting an interview</h2>
                        <Flex wrap="wrap" gap="4">
                            <Box className="flex-1 min-w-[250px]">
                                <div className="flex items-start mb-2">
                                    <span className="text-blue-400 text-lg mr-2">•</span>
                                    <span className="text-gray-300">Use keywords from the job description</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-400 text-lg mr-2">•</span>
                                    <span className="text-gray-300">Quantify your achievements with numbers</span>
                                </div>
                            </Box>
                            <Box className="flex-1 min-w-[250px]">
                                <div className="flex items-start mb-2">
                                    <span className="text-blue-400 text-lg mr-2">•</span>
                                    <span className="text-gray-300">Keep formatting simple for better parsing</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-400 text-lg mr-2">•</span>
                                    <span className="text-gray-300">Match your skills to the job requirements</span>
                                </div>
                            </Box>
                            <Box className="flex-1 min-w-[250px]">
                                <div className="flex items-start mb-2">
                                    <span className="text-blue-400 text-lg mr-2">•</span>
                                    <span className="text-gray-300">Use standard section headings</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-blue-400 text-lg mr-2">•</span>
                                    <span className="text-gray-300">Avoid images, charts, and special characters</span>
                                </div>
                            </Box>
                        </Flex>
                    </Box>
                    
                    {/* Main content with modified AtsScore placement */}
                    <Box className="bg-[#202020] rounded-xl p-6 border border-gray-800 shadow-lg">
                        <AtsScore />
                    </Box>
                </div>
            </div>
            
            <style jsx global>{`
                /* Custom scrollbar styling from ChatInput */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #121212;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                
                /* For Firefox */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #333 #121212;
                }
                
                /* Match the input styling to the chat input but make it more prominent */
                textarea {
                    background-color: #303030 !important;
                    border-color: rgba(148, 163, 184, 0.2) !important;
                    border-radius: 0.75rem !important;
                    padding: 1.25rem 1.5rem !important;
                    color: white !important;
                    resize: none !important;
                    overflow-y: auto !important;
                    line-height: 1.5 !important;
                    min-height: 180px !important;
                    width: 100% !important;
                    font-size: 1.05rem !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                }
                
                textarea:focus {
                    outline: none !important;
                    border-color: rgba(99, 102, 241, 0.6) !important;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
                }
                
                /* Style the Radix UI components to match the dark theme */
                button {
                    background-color: #4f46e5 !important;
                    color: white !important;
                    border-radius: 0.75rem !important;
                    padding: 0.75rem 1.5rem !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                }
                
                button:hover:not(:disabled) {
                    background-color: #4338ca !important;
                    transform: translateY(-1px) !important;
                }
                
                button:disabled {
                    background-color: #3730a3 !important;
                    opacity: 0.6 !important;
                    color: rgba(255, 255, 255, 0.8) !important;
                }
                
                /* Make AtsScore results more attractive */
                ul {
                    padding-left: 1.5rem !important;
                }
                
                li {
                    margin-bottom: 0.5rem !important;
                    color: #d1d5db !important;
                }
                
                /* Improve card styling */
                .ats-section {
                    border-radius: 0.75rem !important;
                    background-color: #202020 !important;
                    padding: 1.25rem !important;
                    margin-bottom: 1.5rem !important;
                    border: 1px solid rgba(75, 85, 99, 0.2) !important;
                }
            `}</style>
        </div>
    );
} 