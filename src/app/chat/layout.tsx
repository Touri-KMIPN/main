"use client"
import { AuthProvider } from '@/providers/AuthProvider'
import AuthSplashProvider from '@/providers/AuthSplashProvider'
import QueryProvider from '@/providers/QueryProvider'
import { SpotsProvider } from '@/providers/SpotsProvider'
import React, { useState } from 'react'
import MapView from '../map/_components/map-view'
import { Button } from '@/components/ui/button'
import { MapIcon, XIcon } from 'lucide-react'
import { useSessionsQuery } from '@/queries/session-query'
import { Sidebar } from '@/components/_layout/sidebar'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mapOpen, setMapOpen] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: sessions } = useSessionsQuery();
    return (
        <>
            <SpotsProvider>
                <AuthProvider>
                    <AuthSplashProvider>
                        <div className="flex h-dvh w-full overflow-hidden bg-background">
                            <Sidebar
                                sessions={sessions}
                                isOpen={sidebarOpen}
                                onToggle={() => setSidebarOpen(!sidebarOpen)}
                            />
                            <div className="flex flex-1 overflow-hidden">

                                <div
                                    className={cn(
                                        "flex-1 transition-all duration-300 overflow-hidden",
                                        mapOpen
                                            ? "w-full md:w-2/5"
                                            : "w-full"
                                    )}
                                >
                                    {children}
                                </div>

                                {/* Map Layout - Fullscreen on mobile, 2/4 on desktop when open */}
                                <div
                                    className={cn(
                                        "transition-all duration-300 border-l border-border overflow-hidden",
                                        mapOpen
                                            ? "fixed inset-0 z-40 h-full bg-background md:static md:left-auto md:right-0 md:w-2/4 md:z-auto"
                                            : "w-0 md:w-0"
                                    )}
                                >
                                    <div className="h-full w-full relative">
                                        <MapView />
                                        <Button
                                            onClick={() => setMapOpen(!mapOpen)}
                                            size="icon"
                                            variant="outline"
                                            className="absolute top-5 left-5 z-50 cursor-pointer h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <XIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Map Toggle Button - Only show when map is closed */}
                                {!mapOpen && (
                                    <Button
                                        onClick={() => setMapOpen(!mapOpen)}
                                        size="icon"
                                        variant="outline"
                                        className="fixed top-5 right-5 z-10 h-12 w-12 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <MapIcon className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </AuthSplashProvider>
                </AuthProvider>
            </SpotsProvider>
        </>
    )
}
