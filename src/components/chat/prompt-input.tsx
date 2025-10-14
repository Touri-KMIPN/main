import React, { useRef, useEffect } from "react";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  CloudUploadIcon,
  EyeIcon,
  Loader2,
  PaperclipIcon,
  SendHorizonalIcon,
} from "lucide-react";
import Link from "next/link";
import FilePreview from "@/components/chat/file-preview";
import { cn } from "@/lib/utils";

// Custom hook for auto-resizing textarea
const useAutoResize = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to calculate the scrollHeight correctly
      textarea.style.height = "auto";
      // Set the height to the scrollHeight to fit content
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  return { textareaRef, adjustTextareaHeight };
};

const convertFileToBase64 = (
  file: File
): Promise<{ name: string; type: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        data: reader.result as string,
      });
    reader.onerror = (error) => reject(error);
  });
};

type PromptInput = {
  onSend: (message: string, files: File[]) => void;
  loading: boolean;
  className?: string;
};

export default function PromptInput({
  onSend,
  loading,
  className,
}: PromptInput) {
  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const { textareaRef, adjustTextareaHeight } = useAutoResize();

  const addFile = (file: File) => {
    setFiles((prev) => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (input.trim() === "" || loading) return;
    // onSend(input, files)

    const currentInput = input;
    const currentFiles = files;

    setInput("");
    setFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (navigator.onLine) {
      console.log("Online, memanggil onSend...");
      onSend(currentInput, currentFiles);
    } else {
      console.log("Offline, menyimpan pesan ke antrean Local Storage...");
      try {
        // Ubah semua file menjadi format Base64 yang bisa disimpan
        const serializableFiles = await Promise.all(
          currentFiles.map((file) => convertFileToBase64(file))
        );

        const messagePayload = {
          prompt: currentInput,
          files: serializableFiles,
        };
      } catch (error) {
        console.error("Gagal mengubah file atau menyimpan ke antrean:", error);
        setInput(currentInput);
        setFiles(currentFiles);
      }
    }

    setFiles([]);
    setInput("");
    // Reset textarea height after sending
    adjustTextareaHeight();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-2 rounded-lg bg-background border",
        className
      )}
    >
      <div
        className={cn(
          "flex gap-2 overflow-x-auto",
          files.length === 0 && "hidden"
        )}
      >
        {files.map((file, index) => (
          <div key={index} className="relative">
            <FilePreview file={file} idx={index} deleteFile={removeFile} />
          </div>
        ))}
      </div>
      <div className="relative flex-1 min-h-[48px]">
        {" "}
        {/* Added container with min-height to maintain space */}
        <textarea
          ref={textareaRef}
          autoFocus
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full p-2 max-h-48 border-none focus:ring-0 focus:outline-none resize-none"
          style={{ height: "auto" }}
        />
      </div>
      <div className="flex justify-between gap-2">
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    disabled={loading}
                    size="icon"
                    variant="secondary"
                    className="size-8 rounded-full cursor-pointer"
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
              <IncludeFilePopoverContent addFile={addFile} />
            </PopoverContent>
          </TooltipProvider>
        </Popover>
        <div className="flex gap-2">
          <TooltipProvider>
            <Link href="/multimodal">
              <Button
                disabled={loading}
                size="sm"
                className="h-8 rounded-full cursor-pointer bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                onClick={handleSend}
              >
                Live Vision
                <EyeIcon />
              </Button>
            </Link>
            <Button
              disabled={loading}
              size="sm"
              className="h-8 rounded-full cursor-pointer"
              onClick={handleSend}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <SendHorizonalIcon />
              )}
            </Button>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

function IncludeFilePopoverContent({
  addFile,
}: {
  addFile: (file: File) => void;
}) {
  // NOTE: Only upload image or pdf for now
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => addFile(file));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-col p-2 rounded-lg hover:bg-muted hover:cursor-pointer"
        onClick={handleFileClick}
      >
        <div className="flex items-center gap-2">
          <CloudUploadIcon className="w-4 h-4" />
          <h4>Upload file</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Upload your screenshots or PDF files to the chat, and start your
          journey!
        </p>
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
  );
}
