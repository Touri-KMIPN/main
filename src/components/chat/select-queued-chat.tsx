import { Message } from "@/types/chat";
import Link from "next/link";
import React from "react";

type SelectQueuedChatProps = {
  options: Map<string, Message>;
};

export default function SelectQueuedChat({ options }: SelectQueuedChatProps) {
  return (
    <div className="space-y-4 text-center h-screen flex justify-center flex-col items-center">
      <h1 className="text-3xl ">Select Chat To Continue</h1>
      <p className="text-lg">
        It seems to be you've been offline for a while... Please select one of
        these chats to continue them!
      </p>
      {[...options.entries()].map(([sessionId, message]) => (
        <Link key={sessionId} href={`/chat/${sessionId}`}>
          <div className="w-full border p-4 rounded-lg cursor-pointer">
            <h2 className="font-semibold">{message.text}</h2>
          </div>
        </Link>
      ))}
    </div>
  );
}
