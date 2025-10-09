import { Content } from "@google/genai";

export interface MessageFile {content: string, mimeType: string}


export interface Message {
    role: NonNullable<Content["role"]>,
    text: string,
    files?: MessageFile[] // Base64 Image
}