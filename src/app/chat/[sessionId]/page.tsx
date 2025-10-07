"use client"
import Conversation from '@/components/chat/conversation-v2';
import { contentToMessage } from '@/lib/chat';
import { useSessionMessagesQuery } from '@/queries/session-query';
import { Message } from '@/types/chat';
import { Loader } from 'lucide-react';
import React, { use, useEffect } from 'react'

export default function Page({ params }: { params: Promise<{ sessionId: string }> }) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { sessionId } = use(params)

  const { data: sessionMessages, isLoading: isLoadingMessages } = useSessionMessagesQuery(
    sessionId ?? undefined,
  );

  useEffect(() => {
    if (sessionMessages) {
      setMessages(
        sessionMessages
          .reverse()
          .map(contentToMessage)
      );
    }
  }, [sessionMessages])

  if (isLoadingMessages) {
    return <div className="flex h-screen items-center justify-center">
      <Loader className="mr-2 h-8 w-8 animate-spin text-muted-foreground/50" />
    </div>;
  }

  return (
    <Conversation messages={messages} setMessages={setMessages} chatSessionId={sessionId} />
  )
}
