"use client";
import React, { useEffect, useMemo, useState } from "react";
import PromptInput from "./prompt-input";
import { useRouter } from "next/navigation";
import { Message } from "@/types/chat";
import { fileToBase64 } from "@/lib/base64";
import { toast } from "sonner";

export default function NewConversation() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (navigator.onLine) {
      setIsOnline(navigator.onLine);
    }
  }, [navigator]);

  console.log(navigator.onLine);

  const handleSend = async (text: string, files: File[]) => {
    console.log("New conversation started with text:", text, files);
    // Generate a new session ID
    const newSessionId = crypto.randomUUID();

    // Convert files to base64
    const base64ParsedFiles = await Promise.all(
      files.map(async (file) => {
        const base64 = await fileToBase64(file);
        return { content: base64, mimeType: file.type };
      })
    );

    // Store the initial message in localStorage
    localStorage.setItem(
      "session" + ";" + newSessionId,
      JSON.stringify({
        role: "user",
        text,
        files: base64ParsedFiles,
      } as Message)
    );

    if (!isOnline) {
      toast.info("You are currently offline.", {
        description: "Your conversation will be started when you're online.",
      });
    } else {
      router.push(`/chat/${newSessionId}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:justify-center justify-between h-full w-full">
      <h1 className="mt-[40dvh] md:mt-0 text-3xl text-center px-4">
        Hi! I'm{" "}
        <span className="font-bold bg-primary bg-clip-text text-transparent">
          Touri
        </span>
        , your travel assistant. <br /> How can I help you today?
      </h1>
      {/* <PromptInput
                className='w-full max-w-screen-sm'
                onSend={handleSend}
                loading={false}
            /> */}

      <div className="shrink-0 bg-background">
        <div className="max-w-screen-sm mx-auto p-4">
          <PromptInput onSend={handleSend} loading={false} />
        </div>
      </div>
    </div>
  );
}
