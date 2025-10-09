"use client";
import { Button } from "@/components/ui/button";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import {
  MessageCirclePlusIcon,
  XIcon,
  AlignJustifyIcon,
  Trash2Icon,
  Ghost,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SessionDocument } from "@/database/collections/sessions";
import Link from "next/link";
import { ModeToggle } from "../theme-toggle";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: SessionDocument[];
}

export function Sidebar({ isOpen, onToggle, sessions }: SidebarProps) {
  const { user } = useKindeAuth();

  return (
    <aside
      className={`relative flex flex-col z-20 border-r border-border bg-sidebar transition-all duration-300 ${
        isOpen ? "w-full md:w-58" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Image
              className="object-cover"
              src={"/icon/Touri.webp"}
              width={32}
              height={32}
              alt={"Touri"}
            />
            <h1 className="text-xl font-bold text-sidebar-foreground">Touri</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-9 w-9 cursor-pointer text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {isOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <AlignJustifyIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link href={"/chat?new=true"}>
          <Button
            variant={isOpen ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 cursor-pointer ",
              isOpen && "justify-center px-2"
            )}
          >
            <MessageCirclePlusIcon className="h-5 w-5 shrink-0" />
            {isOpen && <span className="text-sm">New Chat</span>}
          </Button>
        </Link>
        {isOpen && (
          <>
            <Separator className={"my-2"} />
            {/* History Item */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {sessions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center w-full justify-between group"
                >
                  <Link
                    href={`/chat/${item.id}`}
                    className="hover:cursor-pointer w-full"
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${
                        !isOpen && "justify-center px-2"
                      } text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"`}
                    >
                      {item.summary.length > 20
                        ? `${item.summary.substring(0, 20)}...`
                        : item.summary}
                    </Button>
                  </Link>
                  <Link href={`#`}>
                    <Button
                      variant={"ghost"}
                      className="w-6 h-6 group-hover:opacity-100 md:opacity-0 hover:text-destructive cursor-pointer transition-all"
                    >
                      <Trash2Icon size={8} />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <span className="text-sm font-semibold">
                {user?.given_name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.given_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <ModeToggle />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <span className="text-sm font-semibold">
                {user?.given_name?.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
