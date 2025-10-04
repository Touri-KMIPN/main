import React from 'react'

import { Button } from '../ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { Loader2, PaperclipIcon, SendIcon, SparkleIcon } from 'lucide-react'


type PromptInput = {
    onSend: (text: string) => void
    loading: boolean
}

export default function PromptInput({ onSend, loading }: PromptInput) {
    const [input, setInput] = React.useState("")

    const handleSend = () => {
        if (input.trim() === "" || loading) return
        onSend(input)
        setInput('')
    }

    return (
        <div className='flex flex-col gap-2 p-2 rounded-lg bg-background border'>
            <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                        handleSend()
                    }
                }}
                placeholder='Type your message...'
                className='p-2 flex-1 h-12 border-none focus:ring-0 focus:outline-none'
            />
            <div className='flex justify-between gap-2'>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                disabled={loading}
                                size="icon"
                                variant="secondary"
                                className='size-8 rounded-full'
                            >
                                <PaperclipIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Include files</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className='flex gap-2'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    disabled={loading}
                                    size="icon"
                                    className='size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                    onClick={handleSend} >
                                    <SparkleIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Magic Vision</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    disabled={loading}
                                    size="icon"
                                    className='size-8 rounded-full'
                                    onClick={handleSend} >
                                    {loading
                                        ? <Loader2 className='animate-spin' />
                                        : <SendIcon />
                                    }
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Send</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>
            </div>
        </div>

    )
}
