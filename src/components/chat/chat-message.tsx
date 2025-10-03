import { Message } from '@/types/chat'
import React from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SparkleIcon, SparklesIcon, User2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarkdownLLM } from './markdown-renderer'
import { Separator } from '../ui/separator'

export default function ChatMessage({ text, role }: Message) {
  return (
    <div className='m-4'>
      <div className={cn('p-2 rounded-lg flex flex-col gap-2',
        role === "user" ? 'items-end' : 'items-start'
      )}>
        <Avatar className='size-6'>
          <AvatarFallback className={cn(role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
            {role === "user"
              ? <User2 className='size-4' />
              : <SparklesIcon className='size-4' />
            }
          </AvatarFallback>
        </Avatar>
        <div className={cn(role === "user" && "bg-muted p-2 rounded-l-lg rounded-br-lg w-fit")}>
          <MarkdownLLM markdown={text} />
        </div>
      </div>
    </div>
  )

}
