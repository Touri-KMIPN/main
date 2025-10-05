import { useSpots } from '@/providers/SpotsProvider'
import { TouriClientChatService } from '@/services/client/TouriClientChatService'
import { Message } from '@/types/chat'
import { Spot } from '@/types/spot'
import React, { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import ChatMessage from './chat-message'
import PromptInput from './prompt-input'
import { Part } from '@google/genai'

type ConversationProps = {
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
}

export default function Conversation({ messages, setMessages }: ConversationProps) {
    const { setSpots } = useSpots()
    const chatServiceRef = useRef<TouriClientChatService | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const service = new TouriClientChatService(
            null, // sessionId
            {
                onSpotsAddition: (spots: Spot[]) => {
                    /* onSpotsAddition */
                    console.log("New spots added:", spots)
                    setSpots(prev => prev.concat(spots))
                },
                onResponseStream: (chunk) => {
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
                onResponseEnd: () => {
                    /* response ended */
                    setLoading(false)
                },
                onResponseStart: () => {
                    /* response started */
                    setLoading(true)
                    setMessages((prev) => {
                        const filtered = prev.filter(msg => !(msg.role === 'assistant' && msg.text === ''));
                        return [...filtered, { role: 'assistant', text: '' }];
                    });
                }
            }
        )

        chatServiceRef.current = service
    }, [setSpots, setMessages])

    const handleSend = (parts: Part[]) => {
        if (!parts || !chatServiceRef.current) return;

        // Extract text from parts
        const textParts = parts.filter(part => part.text != null);
        if (textParts.length === 0) return;

        const message = textParts.map(part => part.text).join(' ');

        // add user message
        setMessages(
            (prev) => [...prev, { role: 'user', text: message }]
        );

        // For now, we don't handle files from Parts, but we could extend this
        chatServiceRef.current.sendMessage(message);
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
                            <ChatMessage key={index} {...msg} isLoading={index === messages.length - 1 && loading} />
                        ))}
            </ScrollArea>
            <div className='fixed bottom-0 left-0 right-0 h-32'>
                <div className='max-w-screen-sm mx-auto p-4 z-10'>
                    <PromptInput onSend={handleSend} loading={loading} />
                </div>
            </div>
        </div>
    )
}