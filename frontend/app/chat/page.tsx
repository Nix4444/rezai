"use client";
import { useState, useEffect, useRef } from "react";
import { ChatInput } from "@/ui/ChatInput";
import { chatBubbleType } from "@/app/types/chatBubbleType";
import { Suggestions } from "@/ui/Suggestions";
import { Preview } from "@/ui/Preview";
export default function Home() {
  const [messages, setMessages] = useState<chatBubbleType[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#212121] text-white h-screen  w-screen flex flex-col overflow-hidden" style={{scrollbarGutter:"stable"}}>
      <div className="flex justify-center ml-82 h-152">
        <div
          className="flex flex-col flex-grow space-y-4 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent scrollbar-thumb-rounded-md"
          style={{ scrollbarGutter: "stable" }}
        >
          <div>
            {messages.map((msg, idx) =>
              msg.type === "question" ? (
                <div key={idx} className="flex justify-end mr-82 mt-4">
                  <div className="bg-[#303030] max-w-xs p-3 rounded-xl text-white break-words">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex justify-start mt-4">
                  {msg.skeleton ? (
                    <div className="bg-[#303030] max-w-xs p-3 rounded-xl text-white break-words animate-pulse h-10 w-40" />
                  ) : (
                    <div className="bg-[#303030] max-w-xs p-3 rounded-xl text-white break-words">
                      {msg.text}
                    </div>
                  )}
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center flex-grow">
        <ChatInput messages={messages} setMessages={setMessages} />
        <Suggestions/>
        <Preview/>
      </div>
    </div>
  );
}
