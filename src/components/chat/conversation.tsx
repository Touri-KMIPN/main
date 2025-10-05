import { useSpots } from '@/providers/SpotsProvider'
import { TouriChatService } from '@/services/TouriChatService'
import { Message } from '@/types/chat'
import { Tool } from '@/types/tool'
import React, { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import ChatMessage from './chat-message'
import PromptInput from './prompt-input'
import { Part } from '@google/genai'

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
            (spots) => {
                /* onSpotAddition */
                console.log("New spots added:", spots)
                setSpots(prev => prev.concat(spots))
            },
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

    const handleSend = (parts: Part[]) => {
        if (!parts || !chatServiceRef.current) return;

        // add user message
        setMessages(
            (prev) => [...prev]
                .concat(
                    parts
                        .filter(part => part.text != null)
                        .map(part => ({ role: 'user', text: part.text! }))
                )
        );

        chatServiceRef.current.sendMessage(parts);
    };

    return (
        <div className='conversation-container relative'>
            <ScrollArea className='h-[calc(100vh-8rem)] w-full'>
                {messages.length === 0
                    ? (<>
                        <div className='h-[calc(100vh-8rem)] max-w-sm mx-auto flex justify-center items-center'>
                            <h1 className='text-3xl text-center'>
                                Hi! I'm <span className='font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent'>Touri</span>, your travel assistant. How can I help you today?
                            </h1>
                        </div></>)
                    : messages
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
