"use client";
import React, { useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { resumeHtmlAtom } from './ChatInput';

export function Preview() {

    const [resumeHtml] = useAtom(resumeHtmlAtom);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            const content = typeof resumeHtml === 'string' ? resumeHtml : resumeHtml?.kwargs?.content || '';
            const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        html, body { 
                            margin: 0; 
                            padding: 0;
                            font-family: sans-serif;
                            color: white;
                            height: 100%;
                            overflow-x: hidden; /* Hide horizontal scrollbar */
                        }
                        
                        /* Add white borders to all elements */
                        * {
                            border-color: white !important;
                        }
                        
                        /* Custom scrollbar styling */
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
                    </style>
                </head>
                <body>${content}</body>
                </html>
            `);
            doc.close();
        }
    }, [resumeHtml]);

    return (
        <div className="resume-preview" style={{ position: 'relative', height: '100%' }}>
            <iframe 
                ref={iframeRef}
                title="Resume Preview"
                style={{ 
                    border: 'none', 
                    width: '100%', 
                    height: '100%', 
                    minHeight: '500px',
                    background: 'transparent'
                }}
            />
        </div>
    );
}