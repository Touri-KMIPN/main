"use client";
import Conversation from "@/components/chat/conversation-v2";
import { Message } from "@/types/chat";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";

export default function Page() {
  const [message, setMessage] = React.useState<Message[]>([]);

  const searchParams = useSearchParams()

  const sessionId = useMemo(() => {
    if (searchParams) {
      return searchParams.get("session");
    }
    return null;
  }, [searchParams])

const isNew = useMemo(() => {
    if (searchParams) {
      return searchParams.get("new");
    }
    return null;
  }, [searchParams])

  useEffect(() => {
    if (isNew === "true") {
      setMessage([]);
    }
  }, [isNew])

  return (
    <Conversation chatSessionId={sessionId} messages={message} setMessages={setMessage} />
  );
}
