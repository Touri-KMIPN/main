import { Message } from "@/types/chat";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

type SelectQueuedChatProps = {
  options: Map<string, Message>;
  onSkipQueue?: () => void;
};

export default function SelectQueuedChat({
  options,
  onSkipQueue,
}: SelectQueuedChatProps) {
  return (
    <div className="gap-8 text-center h-screen flex justify-center flex-col items-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Select Chat To Continue</h1>
        <p className="text-lg text-balance leading-relaxed">
          It seems to be you've been offline for a while... <br /> Please select
          one of these chats to continue them!
        </p>
      </div>
      <div className="flex items-center flex-col gap-2">
        {[...options.entries()].map(([sessionId, message]) => (
          <Link key={sessionId} href={`/chat/${sessionId}`}>
            <Button
              className="cursor-pointer px-4 w-md overflow-hidden"
              variant="secondary"
            >
              <h2 className="font-semibold">{message.text}...</h2>
            </Button>
          </Link>
        ))}
      </div>
      <Button
        variant="link"
        className="cursor-pointer text-muted-foreground underline decoration-dotted hover:decoration-solid"
        onClick={onSkipQueue}
      >
        I don't want to continue any chat...
      </Button>
    </div>
  );
}
