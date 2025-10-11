import { Message } from "@/types/chat";
import { Content } from "@google/genai";

export function contentToMessage(content: Content): Message {
    return {
        role: content.role!,
        text: content.parts?.map(part => part.text).join("\n") || "",
        files: content.parts?.filter(part =>
            part.inlineData != null
            && part.inlineData.data != null
            && part.inlineData.mimeType != null)
            .map(part => ({
                content: part.inlineData!.data!,
                mimeType: part.inlineData!.mimeType!
            })) || []
    }
}

/**
 * Extracts the title from a string. The title is expected to be
 * enclosed in double asterisks (e.g., **My Title**).
 *
 * @param text The string to parse.
 * @returns The extracted title string, or null if no title is found.
 */
export function extractTitle(text: string): string | null {
  // Regular expression to find text wrapped in double asterisks.
  // The parentheses (.*?) create a "capturing group" for the content
  // between the asterisks. The '?' makes it non-greedy, so it stops
  // at the first closing double asterisk it finds.
  const titleRegex = /\*\*(.*?)\*\*/;

  const match = text.match(titleRegex);

  // If a match is found, the title will be in the second element
  // of the array (index 1), which corresponds to the first capturing group.
  // Otherwise, return null.
  return match ? match[1] : null;
}