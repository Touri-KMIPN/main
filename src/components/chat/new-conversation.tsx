"use client"
import React from 'react'
import PromptInput from './prompt-input'
import { useRouter } from 'next/navigation';
import { Message } from '@/types/chat';
import { fileToBase64 } from '@/lib/base64';

export default function NewConversation() {

    const router = useRouter();

    const handleSend = async (text: string, files: File[]) => {
        console.log("New conversation started with text:", text, files);
        // Generate a new session ID
        const newSessionId = crypto.randomUUID();

        // Convert files to base64
        const base64ParsedFiles = await Promise.all(files.map(async (file) => {
            const base64 = await fileToBase64(file);
            return { content: base64, mimeType: file.type };
        }));

        // Store the initial message in localStorage
        localStorage.setItem(newSessionId, JSON.stringify({
            role: "user",
            text,
            files: base64ParsedFiles
        } as Message));

        // Redirect to conversation page with new session ID
        router.push(`/chat/${newSessionId}`);
    }

    return (
        <div className='flex flex-col gap-8 items-center justify-center h-screen w-full p-4'>
            <h1 className="text-3xl text-center px-4">
                Hi! I'm{" "}
                <span className="font-bold bg-primary bg-clip-text text-transparent">
                    Touri
                </span>
                , your travel assistant. <br /> How can I help you today?
            </h1>
            <PromptInput
                className='w-full max-w-screen-sm'
                onSend={handleSend}
                loading={false}
            />
        </div>
    )
}
