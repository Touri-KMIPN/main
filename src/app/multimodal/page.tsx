"use client";
import { useState, useCallback } from "react";
import CameraPreviewSDK from "./_components/CameraPreviewSDK";
import { ArrowLeft, MapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MapView from "../map/_components/map-view";
import { SpotsProvider } from "@/providers/SpotsProvider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function Home() {
  const router = useRouter();
  const [mapOpen, setMapOpen] = useState(false);
  const [messages, setMessages] = useState<
    { type: "human" | "gemini"; text: string }[]
  >([]);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages((prev) => [...prev, { type: "gemini", text: transcription }]);
  }, []);

  return (
    <>
      <SpotsProvider>
        <div className="fixed inset-x-5 top-10 z-50 flex items-center justify-between">
          <Button
            className="rounded-full cursor-pointer h-12 w-12"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="z-10 h-12 w-12 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all"
              >
                <MapIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <VisuallyHidden>
                <SheetHeader>
                  <SheetTitle className="sr-only">Map View</SheetTitle>
                </SheetHeader>
              </VisuallyHidden>
              <MapView />
            </SheetContent>
          </Sheet>
        </div>
        <div className="max-h-dvh max-w-dvw overflow-hidden flex flex-col items-center justify-center">
          <div className="flex">
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

          {/* Map Layout - Fullscreen on mobile, 2/4 on desktop when open */}
          {/* {mapOpen && (
            <div
              className={cn(
                "transition-all duration-300 border-l border-border overflow-hidden",
                mapOpen ? "fixed inset-0 z-100 h-full bg-background" : "w-0"
              )}
            >
              <div className="h-full w-full relative">
                <MapView />
                <Button
                  onClick={() => setMapOpen(!mapOpen)}
                  size="icon"
                  variant="outline"
                  className="absolute top-10 left-5 z-50 cursor-pointer h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )} */}

          {/* Map Toggle Button - Only show when map is closed */}
          {/* {!mapOpen && (
            <Button
              onClick={() => setMapOpen(!mapOpen)}
              size="icon"
              variant="outline"
              className="fixed top-5 right-5 z-10 h-12 w-12 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <MapIcon className="h-5 w-5" />
            </Button>
          )} */}
        </div>
      </SpotsProvider>
    </>
  );
}
