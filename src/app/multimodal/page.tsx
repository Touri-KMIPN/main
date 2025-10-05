// app/page.tsx
"use client";
import { useState, useCallback } from 'react';
import CameraPreviewSDK from './_components/CameraPreviewSDK';


export default function Home() {
    const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string }[]>([]);

    const handleTranscription = useCallback((transcription: string) => {
        setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);
    }, []);

    return (
        <>
            <div className="min-h-screen p-8 flex flex-col items-center justify-center">

                <div className="flex gap-2">
                    {/* <CameraPreview onTranscription={handleTranscription} /> */}
                    <CameraPreviewSDK onTranscription={handleTranscription} />
                    {/* <div className="w-[640px] bg-white">
          <ScrollArea className="h-[540px] p-6">
            <div className="space-y-6">
              <GeminiMessage text="Hi! I'm Touri. I can see and hear you. Let's chat!" />
              {messages.map((message, index) => (
                message.type === 'human' ? (
                  <HumanMessage key={`msg-${index}`} text={message.text} />
                ) : (
                  <GeminiMessage key={`msg-${index}`} text={message.text} />
                )
              ))}
            </div>
          </ScrollArea>
        </div> */}
                </div>
            </div>

        </>
    );
}