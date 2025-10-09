import { useSpots } from '@/providers/SpotsProvider'
import { TouriClientChatService } from '@/services/client/TouriClientChatService'
import { Message } from '@/types/chat'
import { Spot } from '@/types/spot'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import ChatMessage from './chat-message'
import PromptInput from './prompt-input'
import { base64ToFile, fileToBase64 } from "@/lib/base64";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { $dexie } from "@/lib/dexie";

type ConversationProps = {
    chatSessionId: string | null,
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    initialMessage: Message | null,
}

export default function Conversation({ messages, setMessages, chatSessionId, initialMessage }: ConversationProps) {
    const { setSpots } = useSpots()
    const chatServiceRef = useRef<TouriClientChatService | null>(null)
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(chatSessionId)
    const router = useRouter()

    const queryClient = useQueryClient()

    // Update sessionId if chatSessionId prop changes
    useEffect(() => {
        if (chatSessionId) {
            setSessionId(chatSessionId)
        }
    }, [chatSessionId])

    // Function to update spots in IndexedDB
    const updateSpotsInDB = useCallback(async (spots: Spot[]) => {
        console.log("onSpotsAddition called with spots:", sessionId, spots);
        if (sessionId) {
            console.log("Storing spots in IndexedDB for session:", sessionId, spots);
            await $dexie.spots.bulkPut(spots.map(spot => ({ ...spot, sessionId })))
        }
    }, [sessionId])

    // Initialize the chat service once
    useEffect(() => {
        chatServiceRef.current = new TouriClientChatService(
            sessionId,
            {
                onSpotsAddition: async (spots: Spot[]) => {
                    /* onSpotsAddition */

                    await updateSpotsInDB(spots);

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
                },
                onSessionCreation: (sessionId) => {
                    // If a new session is created, we can navigate to it
                    if (sessionId) {
                        router.push(`/chat?session=${sessionId}`);
                    }

                    queryClient.invalidateQueries({
                        queryKey: ["sessions"]
                    })
                }
            }
        )
    }, [setSpots, setMessages])

    // Handle message send
    const handleSend = async (message: string, files: File[]) => {
        if (!chatServiceRef.current) return;

        if (message.trim() === "") return;

        const filesPromises = files.map(async (file) => {
            const base64Content = await fileToBase64(file);
            return {
                content: base64Content,
                mimeType: file.type,
            };
        });

        const parsedFiles = (await Promise.all(filesPromises)) as Message["files"];

        // add user message
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: message,
                files: parsedFiles,
            },
        ]);

        // For now, we don't handle files from Parts, but we could extend this
        chatServiceRef.current.sendMessage(message, files);
    };

    useEffect(() => {
        // If there's an initial message (e.g., from a new session), send it
        if (initialMessage && chatServiceRef.current) {
            const fileParsedFromBase64 = initialMessage.files?.map(file => base64ToFile(
                file.content,
                file.mimeType
            ))

            setMessages([initialMessage])
            chatServiceRef.current.sendMessage(initialMessage.text, fileParsedFromBase64 || [])
        }
    }, [initialMessage])


    return (
        <div className="h-full flex flex-col">
            {/* Chat messages area - takes remaining space */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <div className="max-w-screen-sm mx-auto px-4">
                        {messages.length === 0 ? (
                            <>
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <h1 className="text-3xl text-center px-4">
                                        Hi! I'm{" "}
                                        <span
                                            className="font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                            Touri
                                        </span>
                                        , your travel assistant. <br /> How can I help you today?
                                    </h1>
                                </div>
                            </>
                        ) : (
                            <div className="py-4 space-y-4">
                                {messages
                                    .filter((m) => m.role === "user" || m.role === "model" || m.role === "assistant")
                                    .map((msg, index) => (
                                        <ChatMessage
                                            key={index}
                                            {...msg}
                                            isLoading={index === messages.length - 1 && loading}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Fixed prompt input at bottom */}
            <div className="shrink-0 bg-background">
                <div className="max-w-screen-sm mx-auto p-4">
                    <PromptInput onSend={handleSend} loading={loading} />
                </div>
            </div>
        </div>
    );
}
