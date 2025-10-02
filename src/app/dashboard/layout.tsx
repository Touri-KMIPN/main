import { AuthProvider } from '@/providers/AuthProvider'
import AuthSplashProvider from '@/providers/AuthSplashProvider'
import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AuthProvider>
                <AuthSplashProvider>
                    {children}
                </AuthSplashProvider>
            </AuthProvider>
        </>
    )
}
