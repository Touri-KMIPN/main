import React, {useMemo} from "react";
import {FileTextIcon, PaperclipIcon, XIcon} from "lucide-react";

export default function FilePreview({file, deleteFile, idx}: {
    file: File,
    deleteFile?: (idx: number) => void,
    idx?: number
}) {
    const fileName = useMemo(() => {
        if (file.name.length > 10) {
            return file.name.slice(0, 10) + "..."
        }
        return file.name
    }, [file.name])

    return (
        <div className={"aspect-square w-24 rounded-lg border relative overflow-hidden"}>
            {file.type?.startsWith("image/") ? (
                <img
                    src={URL.createObjectURL(file)} // Create a URL for the file
                    alt={file.name}
                    className="object-cover w-full h-full"
                />
            ) : file.type === "application/pdf" ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                    <FileTextIcon className="size-8 text-gray-500"/>
                    <p className="text-xs text-gray-500 text-center px-2">{fileName}.pdf</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                    <PaperclipIcon className="size-8 text-gray-500"/>
                    <p className="text-xs text-gray-500 text-center px-2">Unsupported file</p>
                </div>
            )}
            {deleteFile && (
                <div className={"absolute top-0 right-0 z-50"} onClick={() => {
                    if (idx) {
                        deleteFile(idx)
                    }
                }}>
                    <div
                        className={"p-0.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 m-1 hover:cursor-pointer"}>
                        <XIcon className={"size-4"}/>
                    </div>
                </div>
            )}
        </div>
    )
}
