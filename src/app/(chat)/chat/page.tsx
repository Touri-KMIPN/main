"use client";
import NewConversation from "@/components/chat/new-conversation";
import SelectQueuedChat from "@/components/chat/select-queued-chat";
import { Message } from "@/types/chat";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [isWaitingQueue, setIsWaitingQueue] = useState(false);
  const [queuedSessions, setQueuedSessions] = useState<Map<string, Message>>(
    new Map()
  );

  useEffect(() => {
    console.log("Fetching queued sessions because you are online.");
    const prefix = "session;";
    const matchingKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        matchingKeys.push(key);
      }
    }

    const sessionsMap = new Map<string, Message>();
    matchingKeys.forEach((key) => {
      const sessionId = key.replace(prefix, "");
      const rawMessage = localStorage.getItem(key);
      if (rawMessage) {
        sessionsMap.set(sessionId, JSON.parse(rawMessage) as Message);
      }
    });
    setQueuedSessions(sessionsMap);
    if (sessionsMap.size > 0) {
      setIsWaitingQueue(true);
    }
  }, []);

  if (isWaitingQueue) {
    console.log("You have queued sessions to continue.");
    return (
      <SelectQueuedChat
        options={queuedSessions}
        onSkipQueue={() => setIsWaitingQueue(false)}
      />
    );
  }

  return <NewConversation />;
}
