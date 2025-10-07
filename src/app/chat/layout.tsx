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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mapOpen, setMapOpen] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { data: sessions } = useSessionsQuery();
    return (
        <>
            <SpotsProvider>
                <AuthProvider>
                    <AuthSplashProvider>
                        <div className="flex h-screen w-full overflow-hidden bg-background">
                            <Sidebar
                                sessions={sessions}
                                isOpen={sidebarOpen}
                                onToggle={() => setSidebarOpen(!sidebarOpen)}
                            />
                            <div className="flex flex-1 overflow-hidden">

                                <div
                                    className={`flex-1 transition-all duration-300 ${sidebarOpen ? "w-1/3" : "w-2/5"
                                        }`}
                                >
                                    {children}
                                </div>

                                {/* Map Layout - Right (2/3 width) */}
                                {mapOpen && (
                                    <div className="w-2/4 border-l border-border relative">
                                        <MapView />
                                        <Button
                                            onClick={() => setMapOpen(!mapOpen)}
                                            size="icon"
                                            variant="outline"
                                            className="absolute top-5 left-5 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <XIcon className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}
                                {!mapOpen && (
                                    <Button
                                        onClick={() => setMapOpen(!mapOpen)}
                                        size="icon"
                                        variant="outline"
                                        className="fixed top-5 right-5 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
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
