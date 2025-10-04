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
import { Spot } from "@/types/spot";
import { SearchPlaceTools, GetUserLocationTool, ReverseGeocodingTool } from "@/tools/MapTools";
import { SpotsProviderContext, useSpots } from "@/providers/SpotsProvider";

const MODEL = "gemini-2.5-flash";
const SYSTEM_PROMPT = `
                Your name is Touri, an AI assistant for a tourism app.
                You are a helpful AI assistant for a tourism app called Touri.
                Remember all previous conversation context and user details throughout our conversation.
                Please response expressively and enthusiastically.

                Here are the tools you have access to:

                **Location & Place Search Tools:**
                - search_place: Search for places using text queries (e.g., "best pizza in Rome", "Eiffel Tower"). More flexible than category-based search.
                - get_user_location: Get the user's current geographical coordinates (latitude/longitude).
                - get_geolocation_info: Get detailed information about what places are at a specific location (useful for "where am I?" questions).

                **When to use each tool:**
                
                1. **search_place** - Use when user asks for:
                   - Specific place names: "find Statue of Liberty", "search McDonald's"
                   - Complex queries: "best Italian restaurants", "cheap hotels"
                   - Places with descriptions: "romantic dinner spots", "family-friendly activities"
                
                2. **get_user_location** - Use when:
                   - User asks "where am I?"
                   - You need coordinates for other tools
                   - User wants to know their exact location
                
                3. **reverse_geocode_tool** - Use when:
                   - User asks "what's around me?" or "what places are here?"
                   - User wants to know what specific place they're currently at
                   - Need to identify nearby landmarks within 50 meters

                **Important Guidelines:**
                - Always use tools directly without asking for location first - they handle geolocation automatically
                - When user asks for recommendations, immediately use the appropriate search tool
                - search_place can be used for both broad and specific queries
                - search_place will be automatically searched for nearby location if no specific location (long, lat) is provided
                - you can use search_place to find nearby places by using queries like "places near me" or "restaurants near me"
                - please chain get_user_location or reverse_geocode_tool to get more relevant results of user location. the user of-course did not want their coordinates
                - For historical sites, museums, landmarks - use search_place with descriptive queries
                - Always respond in markdown format
                - Use [[spot:<id>|<label>]] syntax to create interactive spots for places you mention
                - Never make up place IDs or information - only use data from tool responses
                - Be concise, informative, and enthusiastic in your responses

                **Examples:**
                - "show me restaurants" → use get_nearby_place with includedTypes: ["restaurant"]
                - "find historical places" → use search_place with textQuery: "historical sites museums landmarks"
                - "where am I?" → use get_user_location or get_geolocation_info
                - "what's the best pizza place?" → use search_place with textQuery: "best pizza restaurant"
                `

export class TouriChatService {
    /**
     * Utility to listen to spot addition
     */
    onSpotChange: (spots: Spot[]) => void;

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
        onSpotChange: (spots: Spot[]) => void,
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
            .concat([SearchPlaceTools, GetUserLocationTool, ReverseGeocodingTool]) // always include all map tools
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
                text: SYSTEM_PROMPT
            },
            // thinkingConfig: {
            //     thinkingBudget: -1
            // }
        };
    }

    async sendMessage(parts: Part[]) {
        if (this.isGenerating) {
            return // Break if the chat is still generating
        }

        this.isGenerating = true
        try {
            // Add user message to history
            this.history.push({
                parts,
                role: "user"
            })

            // Notify about history change before generating response
            this.onHistoryChange([...this.history]);

            // TODO: Handle Files

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

        // TOOD: Handle Reasoning
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

                if (toolName === "get_nearby_place" || toolName === "search_place") {
                    if (result && (result as any).locations) {
                        this.onSpotChange((result as any).locations as Spot[]);
                    }
                }

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

