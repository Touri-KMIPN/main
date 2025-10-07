import { AuthProvider } from '@/providers/AuthProvider'
import AuthSplashProvider from '@/providers/AuthSplashProvider'
import QueryProvider from '@/providers/QueryProvider'
import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <QueryProvider>
                <AuthProvider>
                    <AuthSplashProvider>
                        {children}
                    </AuthSplashProvider>
                </AuthProvider>
            </QueryProvider>
        </>
    )
}
