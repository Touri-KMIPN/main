import { FileTextIcon } from 'lucide-react'
import React from 'react'

export default function FilePreview({ file }: { file: File }) {
    if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        return <img src={url} alt={file.name} className='object-cover aspect-square rounded-lg h-24' />
    } else if (file.type === 'application/pdf') {
        return (
            <div className='flex flex-col items-center justify-center border rounded-lg h-24 w-24 p-2'>
                <FileTextIcon className='w-8 h-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>{file.name}</p>
            </div>
        )
    } else {
        return null
    }
}
