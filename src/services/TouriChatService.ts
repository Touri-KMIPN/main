import {
    Chat,
    Content,
    FunctionCall,
    GenerateContentConfig,
    GenerateContentResponse,
    GoogleGenAI,
    Part,
} from "@google/genai";
import type { Tool } from "@/types/tool";
import { PlaceTool } from "@/tools/PlaceTool";

const MODEL = "gemini-2.5-flash";

export class TouriChatService {
    /**
     * Utility to listen to spot addition
     */
    onSpotChange: () => void;

    /**
     * Utility to listen to history change
     */
    onHistoryChange: (memory: Content[]) => void;

    /**
     * Utility to listen to response stream
     */
    onResponseStream: (chunk: string) => void;
    onResponseEnd: () => void;
    onResponseStart: () => void;

    tools: Map<string, Tool> = new Map();
    ai: GoogleGenAI;
    chat: Chat;

    history: Content[] = [];
    isGenerating = false;

    constructor(
        onSpotChange: () => void,
        onMemoryChange: (memory: Content[]) => void,
        onResponseStream: (chunk: string) => void,
        onResponseEnd: () => void,
        onResponseStart: () => void,
        tools: Tool[] = [],
        history: Content[] = []
    ) {
        this.onSpotChange = onSpotChange;
        this.onHistoryChange = onMemoryChange;
        this.onResponseStream = onResponseStream;
        this.onResponseEnd = onResponseEnd;
        this.onResponseStart = onResponseStart;

        this.ai = new GoogleGenAI({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
        });

        tools
            .concat([PlaceTool]) // always include PlaceTool
            .filter((tool) => tool.declaration.name != null)
            .forEach((tool) => this.tools.set(tool.declaration.name!, tool));

        this.chat = this.ai.chats.create({
            model: MODEL,
            history: this.history,
            config: this.createConfig(),
        });

        this.history = history
    }

    /**
     * Mengambil deklarasi fungsi dari Map
     * @returns 
     */
    private getFunctionDeclarations() {
        return Array.from(this.tools.values()).map((tool) => tool.declaration);
    }

    /**
     * Membuat Konfigurasi Gemini
     * @returns 
     */
    private createConfig(): GenerateContentConfig | undefined {
        const declarations = this.getFunctionDeclarations();
        if (declarations.length === 0) {
            return undefined;
        }

        return {
            tools: [
                {
                    functionDeclarations: declarations,
                },
            ],
            systemInstruction: {
                text: "You are a helpful AI assistant for a tourism app called Touri. You have access to tools to help users find places and get information. Remember all previous conversation context and user details throughout our conversation."
            }
        };
    }

    async sendMessage(message: string) {
        if (this.isGenerating) {
            return // Break if the chat is still generating
        }

        this.isGenerating = true
        try {
            // Add user message to history
            this.history.push({
                parts: [
                    { text: message }
                ],
                role: "user"
            })

            // Notify about history change before generating response
            this.onHistoryChange([...this.history]);

            const response = await this.ai.models.generateContentStream({
                model: MODEL,
                contents: this.history,
                config: this.createConfig()
            })

            await this.handleMessage(response)
        } catch (error) {
            console.error("Error sending message:", error)
        } finally {
            this.isGenerating = false
        }
    }

    async handleMessage(response: AsyncGenerator<GenerateContentResponse>) {
        let hasStarted = false;
        let fullAssistantResponse = '';

        for await (const chunk of response) {
            if (chunk.functionCalls) {
                const toolParts = await this.executeTools(chunk.functionCalls);

                this.history.push({
                    parts: toolParts,
                    role: "function"
                });

                const toolResponse = await this.ai.models.generateContentStream({
                    model: MODEL,
                    contents: this.history,
                    config: this.createConfig()
                })

                await this.handleMessage(toolResponse)
                return; // Return early to avoid adding incomplete response to history
            }

            if (chunk.text) {
                if (!hasStarted) {
                    this.onResponseStart();
                    hasStarted = true;
                }
                fullAssistantResponse += chunk.text;
                this.onResponseStream(chunk.text)
            }
        }

        // Add the complete assistant response to history
        if (fullAssistantResponse) {
            this.history.push({
                parts: [{ text: fullAssistantResponse }],
                role: "model"
            });
            
            // Notify about history change
            this.onHistoryChange(this.history);
        }

        this.onResponseEnd();
    }


    private async executeTools(functionCalls: FunctionCall[]): Promise<Part[]> {
        const toolResponses: Part[] = [];

        for (const call of functionCalls) {
            const toolName = call.name ?? "";
            const tool = this.tools.get(toolName);

            if (!tool) {
                toolResponses.push({
                    functionResponse: {
                        name: toolName,
                        response: {
                            error: `Tool "${toolName}" is not registered.`,
                        },
                    },
                });
                continue;
            }

            try {
                const args = (call.args ?? {}) as FunctionCall["args"];
                const result = await tool.execute(args);
                toolResponses.push({
                    functionResponse: {
                        id: call.id,
                        name: toolName,
                        response: result,
                    },
                });
            } catch (error) {
                toolResponses.push({
                    functionResponse: {
                        id: call.id,
                        name: toolName,
                        response: {
                            error: error instanceof Error ? error.message : "Unknown tool execution error.",
                        },
                    },
                });
            }
        }

        return toolResponses;
    }
}

