"use client";
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Loader } from 'lucide-react';
import React from 'react'

export default function AuthSplashProvider({ children }: { children: React.ReactNode }) {
    const { isLoading } = useKindeAuth()

    if (isLoading) {
        return <div className='h-screen w-full flex justify-center items-center flex-col gap-8'>
            <img src="/icon/Touri.webp" alt="Touri Logo" className="w-32 h-32" />
            <Loader className='h-12 w-12 animate-spin text-muted-foreground/50' />
        </div>
    }

    return (
        <>
            {children}
        </>
    )
}
