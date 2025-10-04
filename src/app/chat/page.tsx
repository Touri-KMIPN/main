"use client";
import Conversation from '@/components/chat/conversation';
import { SpotsProvider } from '@/providers/SpotsProvider';
import { Message } from '@/types/chat';
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { redirect } from 'next/navigation';
import React from 'react'

export default function Page() {
    const [message, setMessage] = React.useState<Message[]>([]);
    const { user } = useKindeAuth()

    if (!user) {
        redirect("/api/auth/login");
    }

    return (
        <SpotsProvider>
            <div className='max-w-screen-sm mx-auto'>
                <Conversation tools={[]} messages={message} setMessages={setMessage} />
            </div>
        </SpotsProvider>
    )
}
