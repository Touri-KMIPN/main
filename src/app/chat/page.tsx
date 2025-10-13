"use client";
import NewConversation from "@/components/chat/new-conversation";
import SelectQueuedChat from "@/components/chat/select-queued-chat";
import { Message } from "@/types/chat";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function Page() {
  const isOnline = useMemo(() => navigator.onLine === true, []);
  const [queuedSessions, setQueuedSessions] = React.useState<
    Map<string, Message>
  >(new Map());

  useEffect(() => {
    if (isOnline) {
      // Fetch all queued sessions from localStorage
      const prefix = "session;";
      const matchingKeys = []; // Create an empty array to store our results

      // Loop through all items in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Check if the key starts with our prefix
        if (key && key.startsWith(prefix)) {
          matchingKeys.push(key); // If it does, add it to our array
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
    }
  }, [isOnline]);

  if (isOnline && queuedSessions.size > 0) {
    // If online and there are queued sessions, show them
    return <SelectQueuedChat options={queuedSessions} />;
    // return toast("Event has been created");
  }

  return <NewConversation />;
}
