import {
    Content,
    FunctionCall,
    FunctionCallingConfigMode,
    GenerateContentConfig,
    GenerateContentResponse,
    Part,
    Type
} from "@google/genai";
import { Spot } from "@/types/spot";
import { ChatCallableFunction, CallableToolRequestContext } from "@/types/tool";
import { zodToFunctionDeclaration } from "@/lib/function";
import { FileUpload } from "@/app/api/ai/generate/schemas";
import { SessionService } from "@/ai/services/server/SessionService";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ContentDocument } from "@/database/collections/contents";
import { SessionDocument } from "@/database/collections/sessions";
import { SYSTEM_PROMPT } from "./prompts/ChatSystemPrompt";
import { ai } from "@/ai/ai";
import { VertexAISearchAgent } from "@/ai/agents/VertexAISearchAgent";
import { ChatSummarizationAgent } from "@/ai/agents/ChatSummarizationAgent";

export class TouriChatService {
    // State
    isGenerating: boolean = false;
    sessionId: string;

    // Dependencies
    context: CallableToolRequestContext;
    sessionService: SessionService;

    // Tools
    tools: Map<string, ChatCallableFunction>;

    // Agents
    vertexAISearchAgent: VertexAISearchAgent;
    chatSummarizationAgent: ChatSummarizationAgent;

    // Documents (Persistency)
    session: SessionDocument | null = null
    history: ContentDocument[];

    onSpotAdditionCallback: (spots: Spot[]) => void;
    onHistoryChangeCallback: (memory: ContentDocument[]) => void;
    onHistoryPushCallback: (memory: ContentDocument) => void;
    onResponseStreamCallback: (chunk: string) => void;
    onThoughtStreamCallback: (thought: string) => void;
    onResponseStartCallback: () => void;
    onResponseEndCallback: () => void;
    onGenerationStartCallback: () => void;
    onGenerationEndCallback: () => void;
    onSessionCreation: (session: SessionDocument) => void

    constructor(
        {
            sessionId,
            context,
            user,
            onGenerationStart,
            onResponseStart,
            onResponseStream,
            onResponseEnd,
            onGenerationEnd,
            tools,
            onHistoryChange,
            onHistoryPush,
            onSpotAddition,
            onSessionCreation,
            onResponseThought
        }: {
            sessionId: string,
            context: CallableToolRequestContext,
            user: KindeUser<Record<string, any>>,
            tools: ChatCallableFunction[],
            onSpotAddition: (spots: Spot[]) => void,
            onHistoryChange?: (memory: Content[]) => void,
            onHistoryPush?: (memory: Content) => void,
            onResponseStream: (chunk: string) => void,
            onResponseStart: () => void,
            onResponseEnd: () => void,
            onGenerationStart: () => void,
            onGenerationEnd: () => void,
            onSessionCreation: (session: SessionDocument) => void,
            onResponseThought?: (thought: string) => void,
        }
    ) {

        this.history = [];
        this.context = context
        this.onSpotAdditionCallback = onSpotAddition;
        this.onResponseStreamCallback = onResponseStream;
        this.onResponseEndCallback = onResponseEnd;
        this.onResponseStartCallback = onResponseStart;
        this.onHistoryChangeCallback = onHistoryChange ?? (() => {
        });
        this.onHistoryPushCallback = onHistoryPush ?? (() => {
        });
        this.onGenerationStartCallback = onGenerationStart ?? (() => {
        });
        this.onGenerationEndCallback = onGenerationEnd ?? (() => {
        });
        this.onThoughtStreamCallback = onResponseThought ?? (() => {
        });
        this.onSessionCreation = onSessionCreation;
        this.sessionService = new SessionService();
        this.sessionId = sessionId;

        // Convert tools array to a Map for easier access
        this.tools = new Map(tools.map(tool => [tool.name, tool]));

        // Agentic Tools
        this.vertexAISearchAgent = new VertexAISearchAgent()
        this.chatSummarizationAgent = new ChatSummarizationAgent()
    }

    async pushHistory(content: ContentDocument) {
        // Save to db
        await this.sessionService.appendContentToSession(this.sessionId!, {
            sessionId: this.sessionId!,
            parts: content.parts,
            role: content.role,
        })

        this.history.push(content);
        this.onHistoryPushCallback(content);
        this.onHistoryChangeCallback(this.history);
    }

    /**
     * Create the configuration for content generation, including system prompts and tool definitions
     * @private
     */
    private createConfig(): GenerateContentConfig {
        return {
            thinkingConfig: {
                thinkingBudget: 1024,
                includeThoughts: true
            },
            systemInstruction: SYSTEM_PROMPT,
            tools: [
                {
                    functionDeclarations:
                        [
                            zodToFunctionDeclaration(
                                {
                                    name: this.vertexAISearchAgent.name,
                                    description: this.vertexAISearchAgent.description,
                                    schema: this.vertexAISearchAgent.schema,
                                }
                            ),
                            ...Array.from(this.tools).map(([_, tool]) => zodToFunctionDeclaration({
                                name: tool.name,
                                description: tool.description,
                                schema: tool.schema,
                            }))

                        ]
                }
            ],
            // Force tool usage for location-related queries
            toolConfig: {
                functionCallingConfig: {
                    mode: FunctionCallingConfigMode.AUTO 
                }
            }
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
            const summary = await this.chatSummarizationAgent.execute({
                initialChat: initialMessage ?? "New Session"
            });

            this.session = await this.sessionService.createSession(
                this.sessionId,
                summary.text ?? "New session",
                this.context.authenticatedUserId!, 
            )
        }

        const messages = await this.sessionService.getSessionMessages(this.session.id);

        this.history = messages;
        this.onHistoryChangeCallback(this.history);
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

            // Indicate that generation has started
            this.isGenerating = true;
            this.onGenerationStartCallback();

            const response = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: this.history.map(({ role, parts }) => ({ role, parts })),
                config: this.createConfig(),
            });

            await this.handleMessage(response);
        } catch (error) {
            console.error("Error during message generation:", error);
        } finally {
            // Ends Generation
            this.onGenerationEndCallback();
            this.isGenerating = false;
        }
    }

    /**
     * Handle streaming messages from the AI model, including tool calls and response parts
     * @param response Async generator yielding parts of the AI response
     */
    async handleMessage(response: AsyncGenerator<GenerateContentResponse>): Promise<void> {
        let hasStarted = false;
        let fullResponse = ''
        let thoughts = ''
        let pendingFunctionCalls: FunctionCall[] = [];

        for await (const chunk of response) {
            if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
                for (const part of chunk.candidates[0].content.parts) {
                    if (part.functionCall) {
                        // Collect function calls to execute them all at once
                        pendingFunctionCalls.push(part.functionCall);
                    }

                    if (!part.text) {
                        continue;
                    } else if (part.thought) {
                        // Handle thought parts if needed
                        thoughts += part.text;
                        this.onThoughtStreamCallback(thoughts);
                    } else {
                        if (!hasStarted) {
                            this.onResponseStartCallback();
                            hasStarted = true;
                        }

                        fullResponse += part.text;
                        this.onResponseStreamCallback(part.text);
                    }
                }
            }
        }

        // Execute all pending function calls if any
        if (pendingFunctionCalls.length > 0) {
            console.log(`[TouriChatService] Executing ${pendingFunctionCalls.length} function calls:`, 
                pendingFunctionCalls.map(call => call.name));
            
            const toolParts = await this.handleToolCalls(pendingFunctionCalls, this.context);
            await this.pushHistory({
                role: 'function',
                parts: toolParts,
                sessionId: this.sessionId!,
                createdAt: new Date(),
            });

            // Continue the conversation with the tool results
            console.log('[TouriChatService] Continuing conversation with tool results...');
            const followUpResponse = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: this.history.map(({ role, parts }) => ({ role, parts })),
                config: this.createConfig()
            });

            await this.handleMessage(followUpResponse);
            return; // Exit after handling follow-up
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

        this.onResponseEndCallback();
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
            console.log(`[TouriChatService] Executing tool: ${toolName} with args:`, call.args);

            //Handle Agents
            switch (toolName) {
                case this.vertexAISearchAgent.name: {
                    console.log(`[TouriChatService] Executing VertexAI search agent...`);
                    const response = await this.vertexAISearchAgent.execute(call.args);
                    toolResponses.push({
                        functionResponse: {
                            name: toolName,
                            id: call.id,
                            response: {
                                result: response
                            }
                        }
                    });
                    console.log(`[TouriChatService] VertexAI search agent completed`);
                    continue;
                }
            }

            const tool = this.tools.get(toolName);

            if (!tool) {
                console.error(`[TouriChatService] Tool ${toolName} not found`);
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
                console.log(`[TouriChatService] Executing tool ${toolName}...`);
                const executeResult = await tool.execute(call.args ?? {}, context);
                console.log(`[TouriChatService] Tool ${toolName} result:`, executeResult);
                
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
                    await this.onSpotAdditionCallback(executeResult.spots as Spot[])
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

        console.log(`[TouriChatService] Completed ${calls.length} tool calls`);
        return toolResponses
    }

}