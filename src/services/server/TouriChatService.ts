import { Content, FunctionCall, GenerateContentConfig, GenerateContentResponse, GoogleGenAI, Part, Type } from "@google/genai";
import { Spot } from "@/types/spot";
import { CallableTool_2, CallableToolRequestContext } from "@/types/tool";
import { zodToFunctionDeclaration } from "@/lib/function";
import { FileUpload } from "@/app/api/ai/generate/schemas";
import { SessionService } from "@/services/server/SessionService";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ContentDocument } from "@/database/collections/contents";
import { SessionDocument } from "@/database/collections/sessions";

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
                - DON'T USE FUNCTION CALL AND TOOL CALL AT THE SAME TIME
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
    isGenerating: boolean = false;
    sessionId: string;
    isInitialize: boolean = false;
    session: SessionDocument | null = null
    ai: GoogleGenAI;
    history: ContentDocument[];
    tools: Map<string, CallableTool_2>;
    context: CallableToolRequestContext;
    onSpotAddition: (spots: Spot[]) => void;
    onHistoryChange: (memory: ContentDocument[]) => void;
    onHistoryPush: (memory: ContentDocument) => void;
    onResponseStream: (chunk: string) => void;
    onResponseStart: () => void;
    onResponseEnd: () => void;
    onGenerationStart: () => void;
    onGenerationEnd: () => void;
    onThoughtStream: (thought: string) => void;
    onSessionCreation: (session: SessionDocument) => void
    sessionService: SessionService

    constructor({
        sessionId,
        isInitialize,
        user,
        onGenerationStart,
        onResponseStart,
        onResponseStream,
        onResponseEnd,
        onGenerationEnd,
        onThoughtStream,
        tools,
        onHistoryChange,
        onHistoryPush,
        onSpotAddition,
        onSessionCreation
    }: {
        sessionId: string,
        isInitialize?: boolean,
        user: KindeUser<Record<string, any>>,
        tools: CallableTool_2[],
        onSpotAddition: (spots: Spot[]) => void,
        onHistoryChange: (memory: Content[]) => void,
        onHistoryPush: (memory: Content) => void,
        onResponseStream: (chunk: string) => void,
        onResponseStart: () => void,
        onResponseEnd: () => void,
        onGenerationStart: () => void,
        onGenerationEnd: () => void,
        onThoughtStream: (thought: string) => void,
        onSessionCreation: (session: SessionDocument) => void
    }
    ) {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_GENAI_API_KEY!,
        });
        this.history = [];
        this.context = {
            authenticatedUserId: user.id,
            caller: "chat"
        };
        this.onSpotAddition = onSpotAddition;
        this.onHistoryChange = onHistoryChange;
        this.onResponseStream = onResponseStream;
        this.onResponseEnd = onResponseEnd;
        this.onResponseStart = onResponseStart;
        this.onHistoryPush = onHistoryPush;
        this.onGenerationStart = onGenerationStart;
        this.onGenerationEnd = onGenerationEnd;
        this.onThoughtStream = onThoughtStream;
        this.onSessionCreation = onSessionCreation;
        this.sessionService = new SessionService();
        this.sessionId = sessionId;

        // Convert tools array to a Map for easier access
        this.tools = new Map(tools.map(tool => [tool.name, tool]));
    }

    async pushHistory(content: ContentDocument) {
        // Save to db
        await this.sessionService.appendContentToSession(this.sessionId!, {
            sessionId: this.sessionId!,
            parts: content.parts,
            role: content.role,
        })

        this.history.push(content);
        this.onHistoryPush(content);
        this.onHistoryChange(this.history);
    }

    /**
     * Push new spots to the chat (e.g., when a tool returns places)
     * @param spots Array of spots to add
     * @private
     */
    private pushSpot(spots: Spot[]) {
        this.onSpotAddition(spots);
    }

    /**
     * Mark the end of a generation cycle
     * @private
     */
    private endGeneration() {
        this.onGenerationEnd();
        this.isGenerating = false;
    }

    /**
     * Mark the start of a generation cycle
     * @private
     */
    private startGeneration() {
        this.isGenerating = true;
        this.onGenerationStart();
    }

    /**
     * Create a concise summary of the session from the initial message
     * @param initialMessage
     */
    private async createSessionSummary(initialMessage: string) {
        return await this.ai.models.generateContent({
            config: {
                systemInstruction: `Generate a concise summary of the following conversation between 
                a user and an AI assistant. The summary should capture the main topics discussed and
                any important details. Keep it brief, ideally under 50 words.
                
                Examples:
                - Tourism places in Paris
                - Looking for historical sites and museums in Rome
                - Finding family-friendly activities in London
                `,
                thinkingConfig: {
                    thinkingBudget: 0
                }
            },
            model: 'gemini-2.5-flash',
            contents: {
                role: "user",
                text: initialMessage
            }
        })
    }

    /**
     * Create the configuration for content generation, including system prompts and tool definitions
     * @private
     */
    private createConfig(): GenerateContentConfig {
        return {
            thinkingConfig: {
                thinkingBudget: 128,
                includeThoughts: true
            },
            systemInstruction: SYSTEM_PROMPT,
            tools: [
                {
                    functionDeclarations:
                        [
                            {
                                name: "internet_search_tools",
                                description: "Tools that helps with searching in the internet",
                                parameters: {
                                    type: Type.OBJECT,
                                    properties: {
                                        query: {
                                            type: Type.STRING,
                                            description: "The search query to gather info from the internet.",
                                        }
                                    }
                                }
                            },
                            ...Array.from(this.tools).map(([_, tool]) => zodToFunctionDeclaration({
                                name: tool.name,
                                description: tool.description,
                                schema: tool.schema,
                            }))

                        ]
                }
            ],
        }
    }

    private async searchInternet(args: Record<string, unknown>) {
        if ("query" in args) {
            const query = args["query"] as string;

            return await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    text: query
                },
                config: {
                    systemInstruction: `You are an AI assistant that helps users by searching the internet for relevant information.
                    When given a search query, you should provide a concise and informative summary of the most relevant information found online.
                    Ensure that the information is accurate and up-to-date.`,
                    tools: [
                        { googleSearch: {} }
                    ]
                },
            });
        } else {
            return null
        }
    }

    /**
     * Initialize or load a chat session
     * @param initialMessage Optional initial message to kickstart the session (used to generate summary)
     */
    private async initializeSession(initialMessage?: string) {

        const session = await this.sessionService.getSessionById(this.sessionId);
        if (session) {
            this.session = session;
        } else {
            // Create new session
            const summary = await this.createSessionSummary(initialMessage || "New session");

            this.session = await this.sessionService.createSession(
                this.sessionId,
                summary.text ?? "New session",
                this.context.authenticatedUserId!, //
            )
        }

        const messages = await this.sessionService.getSessionMessages(this.session.id);

        this.history = messages;
        this.onHistoryChange(this.history);
    }

    /**
     * Send a message to the AI model, handling session initialization and response streaming
     * @param message The user's message
     * @param files Optional files to include with the message
     */
    async sendMessage(message: string, files: FileUpload[]): Promise<void> {
        if (this.isGenerating) {
            return // Break if the chat is still generating
        }

        try {
            if (!this.session) {
                await this.initializeSession(message);
            }

            await this.pushHistory({
                role: 'user',
                parts: [
                    { text: message },
                    ...files.map(file => ({
                        inlineData: {
                            data: file.content,
                            mimeType: file.mimeType,
                            filename: file.name
                        }
                    }))] as Part[],
                sessionId: this.sessionId!,
                createdAt: new Date(),
            });

            const response = await this.ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: this.history,
                config: this.createConfig(),
            });

            this.startGeneration();
            await this.handleMessage(response);
        } catch (error) {
            console.error("Error during message generation:", error);
        } finally {
            this.endGeneration();
        }
    }

    /**
     * Handle streaming messages from the AI model, including tool calls and response parts
     * @param response Async generator yielding parts of the AI response
     */
    async handleMessage(response: AsyncGenerator<GenerateContentResponse>): Promise<void> {
        let hasStarted = false;
        let fullResponse = ''

        for await (const chunk of response) {
            if (chunk.functionCalls) {
                const toolParts = await this.handleToolCalls(chunk.functionCalls, this.context);
                await this.pushHistory({
                    role: 'function',
                    parts: toolParts,
                    sessionId: this.sessionId!,
                    createdAt: new Date(),
                });

                // After handling tool calls, continue the conversation with the updated history
                const followUpResponse = await this.ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: this.history,
                    config: this.createConfig()
                });

                await this.handleMessage(followUpResponse);
                return; // Exit after handling tool calls and follow-up
            }

            if (chunk.text) {
                if (!hasStarted) {
                    this.onResponseStart();
                    hasStarted = true;
                }
                if (chunk.candidates?.[0].content?.parts) {
                    const thoughtParts = chunk.candidates[0].content.parts.filter(part => part.thought != null);
                    if (thoughtParts.length > 0) {
                        const thoughtText = thoughtParts.map(part => part.thought).join(' ');
                        this.onThoughtStream(thoughtText);
                    } else {
                        fullResponse += chunk.text;
                        this.onResponseStream(chunk.text);
                    }
                }
            }

        }

        // Add the complete response to history after the loop finishes
        if (fullResponse) {
            await this.pushHistory({
                role: 'model',
                parts: [{ text: fullResponse }],
                sessionId: this.sessionId!,
                createdAt: new Date(),
            });
        }

        this.onResponseEnd();
    }

    /**
     * Handle tool function calls made by the AI model
     * @param calls Array of function calls to process
     * @param context Context for tool execution
     * @returns Array of Parts representing tool responses
     */
    async handleToolCalls(calls: FunctionCall[], context: CallableToolRequestContext): Promise<Part[]> {
        const toolResponses: Part[] = [];

        for (const call of calls) {
            const toolName = call.name ?? ""

            if (toolName === "internet_search_tools") {
                const searchResult = await this.searchInternet(call.args ?? {});
                console.log("Search Result", searchResult?.text)
                toolResponses.push({
                    functionResponse: {
                        name: toolName,
                        id: call.id,
                        response: {
                            result: searchResult?.text ?? "No results found"
                        }
                    }
                });
                continue;
            }

            const tool = this.tools.get(toolName);

            if (!tool) {
                toolResponses.push({
                    functionResponse: {
                        name: toolName,
                        id: call.id,
                        response: {
                            error: `Tool ${toolName} not found`
                        }
                    }
                })

                continue;
            }

            try {
                const executeResult = await tool.execute(call.args ?? {}, context);
                toolResponses.push({
                    functionResponse: {
                        name: toolName,
                        id: call.id,
                        response: {
                            result: executeResult
                        }
                    }
                });

                // If the tool returns spots, push them
                if (executeResult && 'spots' in executeResult) {
                    await this.pushSpot(executeResult.spots as Spot[]);
                }

            } catch (error) {
                console.error("[TouriChatService] Error executing tool", toolName, error);
                toolResponses.push({
                    functionResponse: {
                        name: toolName,
                        id: call.id,
                        response: {
                            error: (error as Error).message
                        }
                    }

                })
            }
        }

        return toolResponses
    }

}