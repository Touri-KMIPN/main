import {Message} from '@/types/chat'
import React, {useMemo} from 'react'
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {SparklesIcon, User2} from 'lucide-react'
import {cn} from '@/lib/utils'
import {MarkdownLLM} from './markdown-renderer'
import {useSpots} from '@/providers/SpotsProvider'
import FilePreview from "@/components/chat/file-preview";
import {base64ToFile} from "@/lib/base64";

export default function ChatMessage({text, role, files, isLoading = false}: Message & { isLoading?: boolean }) {
    const {spots} = useSpots()

    const parsedFiles = useMemo(() => {
        return files?.map(file => base64ToFile(file.content, file.mimeType))
    }, [files])

    return (
        <div className='m-4'>
            <div className={cn('p-2 rounded-lg flex flex-col gap-2',
                role === "user" ? 'items-end' : 'items-start flex-row'
            )}>
                <Avatar className='size-6'>
                    <AvatarFallback
                        className={cn(role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                        {role === "user"
                            ? <User2 className='size-4'/>
                            : <SparklesIcon className='size-4'/>
                        }
                    </AvatarFallback>
                </Avatar>
                <div className={"flex items-center gap-2 overflow-x-auto"}>
                    {parsedFiles && parsedFiles.map((file, index) => (
                        <div key={index} className='relative'>
                            <FilePreview
                                file={file}
                            />
                        </div>
                    ))}
                </div>
                <div className={cn(role === "user" && "bg-muted p-2 rounded-l-lg rounded-br-lg w-fit")}>
                    <MarkdownLLM markdown={text} spots={spots}/> {isLoading && <span className='animate-pulse'>█</span>}
                </div>
            </div>
        </div>
    )

}
