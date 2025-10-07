"use client";
import { Sidebar } from "@/components/_layout/sidebar";
import Conversation from "@/components/chat/conversation-v2";
import { SpotsProvider } from "@/providers/SpotsProvider";
import { Message } from "@/types/chat";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import MapView from "../map/page";
import { Button } from "@/components/ui/button";
import { MapIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Page() {
  const [message, setMessage] = React.useState<Message[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(true);
  const { user } = useKindeAuth();

  if (!user) {
    redirect("/api/auth/login");
  }

  return (
    <SpotsProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Layout - Center */}
          <div
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "w-1/3" : "w-2/5"
            }`}
          >
            <Conversation messages={message} setMessages={setMessage} />
          </div>

          {/* Map Layout - Right (2/3 width) */}
          <div
            className={cn(
              " transition-all duration-300 border-l border-border relative",
              mapOpen ? "w-2/4" : "w-0"
            )}
          >
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

          {/* Map Toggle Button */}
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
    </SpotsProvider>
  );
}
