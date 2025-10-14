import NewConversation from "@/components/chat/new-conversation";
import React from "react";

export default function Page() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <NewConversation offlineMode />
        <p className="text-muted-foreground text-sm">
          It seems to be you've been offline for a while... Please select one of
          these chat to continue them!
        </p>
      </div>
    </div>
  );
}
