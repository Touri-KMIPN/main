import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { SendIcon } from "lucide-react";

export default function FloatingMessageButton() {
  return (
    <Link
      href="/chat"
      className="flex items-center justify-center gap-2 fixed bottom-5 right-5 lg:bottom-8 lg:right-8 animate-bounce py-2 px-6 bg-primary-foreground text-secondary-foreground rounded-full shadow-lg"
    >
      Start a Message!
      <SendIcon size={14} />
    </Link>
  );
}
