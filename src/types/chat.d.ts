import { Content } from "@google/genai";

export interface Message {
    role: NonNullable<Content["role"]>,
    text: string,
    files?: {content: string, mimeType: string}[] // Base64 Image
}