"use client";
import Conversation from "@/components/chat/conversation-v2";
import { Message } from "@/types/chat";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

export default function Page() {
  const [message, setMessage] = React.useState<Message[]>([]);

  const searchParams = useSearchParams()

  const sessionId = useMemo(() => {
    if (searchParams) {
      return searchParams.get("session");
    }
    return null;
  }, [searchParams])

  return (
    <Conversation chatSessionId={sessionId} messages={message} setMessages={setMessage} />
  );
}
