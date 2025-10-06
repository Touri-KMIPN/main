import { Content } from "@google/genai";

export interface Message {
    role: Content["role"],
    text: string,
    files?: {content: string, mimeType: string}[] // Base64 Image
}