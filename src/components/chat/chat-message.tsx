import { Message } from "@/types/chat";
import React, { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {  SparklesIcon, User2, User2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownLLM } from "./markdown-renderer";
import { useSpots } from "@/providers/SpotsProvider";
import { base64ToFile } from "@/lib/base64";
import FilePreview from "./file-preview";
import Image from "next/image";

export default function ChatMessage({
  text,
  role,
  files,
  isLoading = false,
  thought = "Thinking"
}: Message & { isLoading?: boolean, thought?: string }) {
  const { spots } = useSpots();

  const parsedFiles = useMemo(() => {
    return files?.map((file) => base64ToFile(file.content, file.mimeType));
  }, [files]);

  return (
    <div className="m-4">
      <div
        className={cn(
          "p-2 rounded-lg flex gap-2",
          role === "user" ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Avatar className="size-8">
          <AvatarFallback
            className={cn(
              role === "model"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary"
            )}
          >
            {role === "user" ? (
              <User2Icon className="size-4" />
            ) : (
              // <SparklesIcon className="size-4" />
              <Image src={"/icon/web-app-manifest-192x192.png"} alt="touri" fill className="size-4"  />
            )}
          </AvatarFallback>
        </Avatar>
        <div className={"flex items-center gap-2 overflow-x-auto"}>
          {parsedFiles &&
            parsedFiles.map((file, index) => (
              <div key={index} className="relative">
                <FilePreview file={file} />
              </div>
            ))}
        </div>
        <div
          className={cn(
            role === "user" && "bg-muted p-2 rounded-l-lg rounded-br-lg w-fit"
          )}
        >
          {isLoading && <>
            <span className="animate-pulse">{thought}...</span>
            <br />
          </>}
          <MarkdownLLM markdown={text} spots={spots} /> {isLoading && <span className="animate-pulse">█</span>}
        </div>
      </div>
    </div >
  );
}
