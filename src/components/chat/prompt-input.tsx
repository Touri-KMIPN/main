import React from 'react'

import { Button } from '../ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { CloudUploadIcon, EyeIcon, Loader2, PaperclipIcon, SendIcon } from 'lucide-react'
import Link from 'next/link'
import FilePreview from "@/components/chat/file-preview";
import { cn } from "@/lib/utils";

type PromptInput = {
    onSend: (message: string, files: File[]) => void
    loading: boolean,
    className?: string,
}

export default function PromptInput({ onSend, loading, className }: PromptInput) {
    const [input, setInput] = React.useState("")
    const [files, setFiles] = React.useState<File[]>([])

    const addFile = (file: File) => {
        setFiles((prev) => [...prev, file])
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSend = () => {
        if (input.trim() === "" || loading) return
        onSend(input, files)
        setFiles([])
        setInput('')
    }

    return (
        <div className={cn('flex flex-col gap-2 p-2 rounded-lg bg-background border', className)}>
            <div className={cn('flex gap-2 overflow-x-auto', files.length === 0 && 'hidden')}>
                {files.map((file, index) => (
                    <div key={index} className='relative'>
                        <FilePreview
                            file={file}
                            idx={index}
                            deleteFile={removeFile}
                        />
                    </div>
                ))}
            </div>
            <textarea
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !loading) {
                        e.preventDefault()
                        handleSend()
                    }
                }}
                placeholder='Type your message...'
                className='p-2 flex-1 min-h-12 border-none focus:ring-0 focus:outline-none resize-none'
                rows={1}
            />
            <div className='flex justify-between gap-2'>
                <Popover>
                    <TooltipProvider>
                        <Tooltip>
                            <PopoverTrigger asChild>
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
                            </PopoverTrigger>
                            <TooltipContent>
                                <p>Include files</p>
                            </TooltipContent>
                        </Tooltip>
                        <PopoverContent>
                            <IncludeFilePopoverContent
                                addFile={addFile}
                            />
                        </PopoverContent>
                    </TooltipProvider>
                </Popover>
                <div className='flex gap-2'>
                    <TooltipProvider>
                        <Link href="/multimodal">
                            <Button
                                disabled={loading}
                                size="sm"
                                className='h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                onClick={handleSend}>
                                Live Vision
                                <EyeIcon />
                            </Button>
                        </Link>
                        <Button
                            disabled={loading}
                            size="sm"
                            className='h-8 rounded-full'
                            onClick={handleSend}>
                            Send
                            {loading
                                ? <Loader2 className='animate-spin' />
                                : <SendIcon />
                            }
                        </Button>
                    </TooltipProvider>
                </div>
            </div>
        </div>

    )
}


function IncludeFilePopoverContent(
    {
        addFile
    }: {
        addFile: (file: File) => void,
    }) {
    // NOTE: Only upload image or pdf for now
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            Array.from(files).forEach(file => addFile(file))
        }
    }

    return (
        <div className='flex flex-col gap-2'>
            <div
                className="flex flex-col p-2 rounded-lg hover:bg-muted hover:cursor-pointer"
                onClick={handleFileClick}
            >
                <div className="flex items-center gap-2">
                    <CloudUploadIcon className='w-4 h-4' />
                    <h4>Upload file</h4>
                </div>
                <p className='text-xs text-muted-foreground'>Upload your screenshots or PDF files to the chat, and start
                    your journey!</p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    )
}