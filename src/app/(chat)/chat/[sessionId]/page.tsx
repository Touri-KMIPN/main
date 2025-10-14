"use client";
import Conversation from "@/components/chat/conversation";
import { contentToMessage } from "@/lib/chat";
import { $dexie } from "@/lib/dexie";
import { useSpots } from "@/providers/SpotsProvider";
import { useSessionMessagesQuery } from "@/queries/session-query";
import { Message } from "@/types/chat";
import { Spot } from "@/types/spot";
import { Loader } from "lucide-react";
import React, { use, useEffect, useMemo } from "react";

async function fetchSpots(sessionId: string, onFound: (spots: Spot[]) => void) {
  const spots = await $dexie.spots
    .where("sessionId")
    .equals(sessionId)
    .toArray();
  onFound(spots);
}

export default function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { spots, setSpots } = useSpots();

  const { sessionId } = use(params);

  // Get Initial Message from the first message if it's a new session
  const initialMessage = useMemo(() => {
    const delimitedSessionId = "session" + ";" + sessionId;

    const rawMessage = localStorage.getItem(delimitedSessionId);
    // Clear it from localStorage after retrieving
    if (rawMessage) {
      localStorage.removeItem(delimitedSessionId  );
      return JSON.parse(rawMessage) as Message;
    }

    return null;
  }, []);

  const isNew = useMemo(() => {
    if (initialMessage) {
      return true;
    }
    return false;
  }, [initialMessage]);

  // Fetch messages for the session
  const { data: sessionMessages, isLoading: isLoadingMessages } =
    useSessionMessagesQuery(
      sessionId ?? undefined, //
      isNew === true // isNewSession
    );

  // When sessionMessages change, update the messages state
  useEffect(() => {
    if (sessionMessages) {
      setMessages(sessionMessages.map(contentToMessage));
    }
  }, [sessionMessages]);

  // On component mount, fetch spots from IndexedDB for the session
  useEffect(() => {
    if (sessionId) {
      fetchSpots(sessionId, (fetchedSpots) => {
        console.log("Fetched spots from IndexedDB", fetchedSpots);
        setSpots(
          fetchedSpots
            // Only add spots that are not already in the state
            .filter((spot) => !spots.some((s) => s.id === spot.id))
        );
      });
    }
  }, [sessionId]);

  if (isLoadingMessages) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="mr-2 h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <Conversation
      initialMessage={initialMessage ?? null}
      messages={messages}
      setMessages={setMessages}
      chatSessionId={sessionId}
    />
  );
}
