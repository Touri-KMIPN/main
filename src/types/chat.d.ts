import { Content } from "@google/genai";

export interface Message {
    role: Content["role"],
    text: string
}