import { useSpots } from '@/providers/SpotsProvider'
import { TouriChatService } from '@/services/TouriChatService'
import { Message } from '@/types/chat'
import { Tool } from '@/types/tool'
import React, { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import ChatMessage from './chat-message'
import PromptInput from './prompt-input'

type ConversationProps = {
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    tools: Tool[]
}

export default function Conversation({ messages, setMessages, tools }: ConversationProps) {
    const { spots, setSpots } = useSpots()
    const chatServiceRef = useRef<TouriChatService | null>(null)

    useEffect(() => {
        const service = new TouriChatService(
            () => { /* onSpotAddition */ },
            (memory) => {
                /* memory changed (full history) */
                // TODO: Save memory if needed
            },
            (chunk) => {
                // streaming response chunk
                setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'assistant') {
                        // append to existing assistant message
                        return [
                            ...prev.slice(0, -1),
                            { role: 'assistant', text: last.text + chunk },
                        ];
                    } else {
                        // create new assistant message if none exists
                        return [...prev, { role: 'assistant', text: chunk }];
                    }
                });
            },
            () => { /* response ended */ },
            () => {
                /* response started */
                setMessages((prev) => {
                    const filtered = prev.filter(msg => !(msg.role === 'assistant' && msg.text === ''));
                    return [...filtered, { role: 'assistant', text: '' }];
                });
            },
            tools /* tools */,
            /* initial history */
        )

        chatServiceRef.current = service
    }, [])

    const handleSend = (content: string) => {
        const text = content.trim();
        if (!text || !chatServiceRef.current) return;

        // add user message
        setMessages((prev) => [...prev, { role: 'user', text }]);

        chatServiceRef.current.sendMessage(text);
    };

    return (
        <div className='conversation-container relative'>
            <ScrollArea className='h-[calc(100vh-8rem)] w-full'>
                {messages
                    .filter(m => m.role === "user" || m.role === "assistant")
                    .map((msg, index) => (
                        <ChatMessage key={index} {...msg} />
                    ))}
            </ScrollArea>
            <div className='fixed bottom-0 left-0 right-0 h-32'>
                <div className='max-w-screen-sm mx-auto p-4 z-10'>
                    <PromptInput onSend={handleSend} loading={false} />
                </div>
            </div>
        </div>
    )
}
