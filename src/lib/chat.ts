import { Message } from "@/types/chat";
import { Content } from "@google/genai";

export function contentToMessage(content: Content): Message {
    return {
        role: content.role!,
        text: content.parts?.map(part => part.text).join("\n") || "",
        // files: content.parts?.filter(part => part.inlineData != null && part.inlineData.data != null && part.inlineData.mimeType != null)
        //     .map(part => ({
        //         content: part.inlineData!.data!,
        //         mimeType: part.inlineData!.mimeType!
        //     })) || []
    }
}