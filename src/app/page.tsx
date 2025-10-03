"use client"
import Conversation from "@/components/chat/conversation";
import { SpotsProvider } from "@/providers/SpotsProvider";
import { GetCurrentTimeTool } from "@/tools/GetCurrentTimeTool";
import { Message } from "@/types/chat";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<Message[]>([]);

  return (
    <SpotsProvider>
      <div className="max-w-screen-sm mx-auto">
        <Conversation tools={[GetCurrentTimeTool]} messages={message} setMessages={setMessage} />
      </div>
    </SpotsProvider>
  );
}
