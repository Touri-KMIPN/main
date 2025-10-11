"use client";
import { useState, useCallback } from "react";
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
import CameraPreviewNeo from "./_components/CameraPreviewNeo";

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
          {/* <Sheet>
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
          </Sheet> */}
        </div>
        <div className="max-h-dvh max-w-dvw overflow-hidden flex flex-col items-center justify-center">
          <div className="flex">
            <CameraPreviewNeo onTranscription={handleTranscription} />
          </div>
        </div>
      </SpotsProvider>
    </>
  );
}
