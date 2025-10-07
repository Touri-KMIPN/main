"use client";
import { Sidebar } from "@/components/_layout/sidebar";
import Conversation from "@/components/chat/conversation-v2";
import { SpotsProvider } from "@/providers/SpotsProvider";
import { Message } from "@/types/chat";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import MapView from "../map/_components/map-view";
import { Button } from "@/components/ui/button";
import { Loader, Map, XIcon } from "lucide-react";
import { contentToMessage } from "@/lib/chat";
import { useSessionMessagesQuery, useSessionsQuery } from "@/queries/session-query";

export default function Page() {
    const [message, setMessage] = React.useState<Message[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mapOpen, setMapOpen] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean | null>(null);

    const searchParams = useSearchParams()

    const sessionId = useMemo(() => {
        if (searchParams) {
            return searchParams.get("session");
        }
        return null;
    }, [searchParams])

    // Set isInitialLoad only once on component mount
    useEffect(() => {
        if (isInitialLoad === null && searchParams) {
            setIsInitialLoad(!searchParams.has("session"));
        }
    }, [searchParams, isInitialLoad])

    // Query messages
    const { data: sessionMessages, isLoading: isLoadingMessages } = useSessionMessagesQuery(
        sessionId ?? undefined,
        isInitialLoad === null ? true : isInitialLoad,
    );

    // Query sessions
    const { data: sessions } = useSessionsQuery();

    // Update messages when session data is loaded
    useEffect(() => {
        if (sessionMessages) {
            setMessage(sessionMessages.map(contentToMessage));
        }
    }, [sessionMessages]);

    if (isLoadingMessages) {
        return <div className="flex h-screen items-center justify-center">
            <Loader className="mr-2 h-8 w-8 animate-spin text-muted-foreground" />
        </div>;
    }

    return (
        <SpotsProvider>
            <div className="flex h-screen w-full overflow-hidden bg-background">
                <Sidebar
                    sessions={sessions}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
                <div className="flex flex-1 overflow-hidden">
                    {/* Chat Layout - Center */}
                    <div
                        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "w-1/3" : "w-2/5"
                            }`}
                    >
                        <Conversation messages={message} setMessages={setMessage} chatSessionId={sessionId} />
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
                            <Map className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </SpotsProvider>
    );
}
