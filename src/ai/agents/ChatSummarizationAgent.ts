import { ai } from "../ai";
import z from "zod";
import { BaseAgent } from "./abstract";

export class ChatSummarizationAgent extends BaseAgent {
    readonly name = "chat_summarization_agent";
    readonly description = "An agent that summarizes chat conversations.";
    readonly schema = z.object({
        initialChat: z.string().describe("The initial chat message."),
    });

    protected async run(args: z.infer<typeof this.schema>) {
        const { initialChat } = args;
        
        return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: initialChat }],
            config: {
                systemInstruction: `
                Generate a concise summary of the following conversation between 
                a user and an AI assistant. The summary should capture the main topics discussed and
                any important details. Keep it brief, ideally under 50 words.
                
                Examples:
                - Tourism places in Paris
                - Looking for historical sites and museums in Rome
                - Finding family-friendly activities in London`,
            }
        });
    }
}
