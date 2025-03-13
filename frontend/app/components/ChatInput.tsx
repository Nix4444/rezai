"use client";
import { useState, ReactElement, useEffect, useRef } from "react";
import SendArrow from "@/app/icons/SendArrow";
import axios from "axios";
import { chatBubbleType } from "@/app/types/chatBubbleType";
import { useSession } from "next-auth/react";
import { atom, useAtom } from 'jotai';

interface SendButtonProps {
  icon: ReactElement;
  onClick: () => void;
  inputText: string;
  loading:boolean
}
interface InputProps {
  messages: chatBubbleType[];
  setMessages: React.Dispatch<React.SetStateAction<chatBubbleType[]>>;
}

type ResumeHtmlType = 
  | string 
  | { kwargs?: { content?: string } }; // Define the expected structure

export const resumeHtmlAtom = atom<ResumeHtmlType>('<p>Preview for your resume will appear here...</p>');


function SendButton({ icon, onClick, inputText, loading }: SendButtonProps) {
  const isEmpty = inputText.trim() === "";
  return (
    <button
      onClick={onClick}
      disabled={isEmpty || loading}
      className={`absolute right-3 top-3 ${
        isEmpty ? "bg-[#A0AEC0]" : "bg-white"
      } text-black rounded-full cursor-pointer p-2 transition-colors z-10`}
    >
      <div className="w-5 h-5">{icon}</div>
    </button>
  );
}

export function ChatInput(props: InputProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [generatedObj, setGeneratedObj] = useState<Record<string, string>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const hasConnectedRef = useRef<boolean>(false);
  const [waitingForResponseToPrompt, setWaitingForResponseToPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [, setResumeHtml] = useAtom(resumeHtmlAtom);

  useEffect(() => {
    if (hasConnectedRef.current || wsRef.current) {
      return;
    }
    
    const setupWebSocket = async () => {
      if (!session?.user?.id) return;

      try {
        hasConnectedRef.current = true;
        

        const tokenResponse = await fetch('/api/auth/token');
        const tokenData = await tokenResponse.json();
        
        
        if (!tokenData.token) {

          hasConnectedRef.current = false;
          return;
        }
        
        const wsUrl = `ws://localhost:3001?token=${encodeURIComponent(tokenData.token)}`;

        
        const ws = new WebSocket(wsUrl);
        
        ws.onerror = (error) => {

          hasConnectedRef.current = false;
        };
        
        ws.onopen = () => {
          setWsConnected(true);

          wsRef.current = ws;

          ws.send(JSON.stringify({ 
            type: 'initializeChain', 
            data: {} 
          }));
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
      
          if (data.type === 'message') {

            props.setMessages(prev => [
              ...prev, 
              { type: 'answer', text: data.data.message, skeleton: false }
            ]);
            
            if (data.data.requiresResponse) {
              
              setWaitingForResponseToPrompt(true);
              setCurrentPrompt(data.data.message);
              

              if (inputRef.current) {
                inputRef.current.placeholder = `Type your response...`;
              }
            }
          } 
          else if (data.type === 'response') {

            if (data.data.result && data.data.result.resumeData) {
              setGeneratedObj(data.data.result.resumeData);


            }
          } else if (data.type === 'error') {
            props.setMessages(prev => [
              ...prev, 
              { type: 'answer', text: `Sorry, there was an error. Please try again.`, skeleton: false }
            ]);
          }
        };
        
        ws.onclose = () => {

          setWsConnected(false);
          hasConnectedRef.current = false;
        };
      } catch (error) {
        hasConnectedRef.current = false;
      }
    };
    
    setupWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      hasConnectedRef.current = false; 
    };
  }, [session?.user?.id]); 

  useEffect(() => {
    const updateProfile = async () => {
      if (session?.user?.id && Object.keys(generatedObj).length > 0) {
        try {

          const tokenResponse = await fetch('/api/auth/token');
          const { token } = await tokenResponse.json();
          
          if (!token) {
            return;
          }
          
          await axios.post('http://localhost:3001/api/update-profile', 
            { profileData: generatedObj },
            { 
              headers: { 
                Authorization: `Bearer ${token}` 
              },
              withCredentials: true
            }
          );
          
          
          const fetchHtml = async (retryCount = 0) => {
            try {
              const htmlResponse = await axios.get('http://localhost:3001/api/generate-resume', {
                headers: { 
                  Authorization: `Bearer ${token}` 
                },
                withCredentials: true
              });
              
              if (htmlResponse.data) {
                setResumeHtml(htmlResponse.data);
                
                props.setMessages(prev => [
                  ...prev, 
                  { type: 'answer', text: 'Your resume has been generated successfully! You can see the preview on the right panel.', skeleton: false }
                ]);
              }
            } catch (error) {
              if (axios.isAxiosError(error) && error.response) {
              }
              
              if (retryCount < 3) {
                setTimeout(() => fetchHtml(retryCount + 1), 2000);
              } else {
                props.setMessages(prev => [
                  ...prev, 
                  { type: 'answer', text: 'There was an error generating your resume preview. Please try again.', skeleton: false }
                ]);
              }
            }
          };
          
          fetchHtml();
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
          }
          props.setMessages(prev => [
            ...prev, 
            { type: 'answer', text: 'There was an error updating your profile. Please try again.', skeleton: false }
          ]);
        }
      }
    };
    
    updateProfile();
  }, [generatedObj, session?.user?.id, setResumeHtml, props.setMessages]);

  useEffect(() => {
    if (wsConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {

      if (props.messages.length === 0) {

        const timer = setTimeout(() => {

          props.setMessages(prev => [
            ...prev,
            { type: "question", text: "help me build a resume", skeleton: false }
          ]);
          
          wsRef.current?.send(JSON.stringify({
            type: 'message',
            data: { message: "help me build a resume" }
          }));
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [wsConnected, props.setMessages, props.messages.length]);

  const handleSend = async () => {
    if (inputText.trim() !== "" && !loading) {
      const questionText = inputText;
      

      const newQuestion: chatBubbleType = { type: "question", text: questionText, skeleton: false };
      props.setMessages((prev) => [...prev, newQuestion]);
      
      setLoading(true);
      setInputText("");
      
      

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          if (waitingForResponseToPrompt) {
            wsRef.current.send(JSON.stringify({
              type: 'message',
              data: { message: questionText }
            }));
            setWaitingForResponseToPrompt(false);
            setCurrentPrompt(null);
            

            if (inputRef.current) {
              inputRef.current.placeholder = "Talk to your Resume...";
            }
          } else {

            wsRef.current.send(JSON.stringify({
              type: 'message',
              data: { message: questionText }
            }));
          }
        } catch (error) {
          props.setMessages((prev) => [
            ...prev, 
            { type: "answer", text: "Error sending message. Please try again.", skeleton: false }
          ]);
        }
      } else {
        props.setMessages((prev) => [
          ...prev, 
          { type: "answer", text: "Error: WebSocket not connected. Please refresh the page.", skeleton: false }
        ]);
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={inputRef}
          placeholder={waitingForResponseToPrompt ? `Respond to question...` : "Talk to your Resume..."}
          className="w-full border bg-[#303030] border-slate-300 px-6 py-4 rounded-xl focus:outline-none overflow-y-auto overflow-x-hidden whitespace-normal pr-20 resize-none"
          style={{ 
            lineHeight: "1.5", 
            scrollbarWidth: "thin",
            scrollbarColor: "#333 #121212"
          }}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if(!loading && inputText !== ""){
                handleSend();
              }
            }
          }}
        />
        <div className="absolute right-3 top-3">
          <SendButton
            icon={<SendArrow />}
            onClick={handleSend}
            inputText={inputText}
            loading={loading}
          />
        </div>
        <style jsx global>{`
          /* Custom scrollbar for the entire app */
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
          
          /* Prevent horizontal scrollbars */
          body {
            overflow-x: hidden;
          }
        `}</style>
      </div>
    </div>
  );
}
