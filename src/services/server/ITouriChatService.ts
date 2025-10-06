import {Spot} from "@/types/spot";
import {CallableTool_2, CallableToolRequestContext} from "@/types/tool";
import {Content, FunctionCall, GenerateContentResponse, GoogleGenAI, Part} from "@google/genai";
import {FileUpload} from "@/app/api/ai/generate/schemas";

export interface ITouriChatService {
    /** Indicates if the AI is currently generating a response */
    isGenerating: boolean;
    /** The Google GenAI instance used for generating content */
    ai: GoogleGenAI;
    /** The history of user messages and AI responses */
    history: Content[];
    /** A map of available tools that can be called during the chat */
    tools: Map<string, CallableTool_2>;
    /** The context for the current tool request */
    context: CallableToolRequestContext;
    /** Called when new spots are added */
    onSpotAddition: (spots: Spot[]) => void;
    /** Called when the history changes */
    onHistoryChange: (memory: Content[]) => void;
    /** Called when a new chunk of the response is received */
    onHistoryPush: (memory: Content) => void;
    /** Called when a new chunk of the response is received */
    onResponseStream: (chunk: string) => void;
    /** Called when the response starts */
    onResponseStart: () => void;
    /** Called when the response ends */
    onResponseEnd: () => void;
    /** Called when generation starts */
    onGenerationStart: () => void;
    /** Called when generation ends */
    onGenerationEnd: () => void;

    /**
     * Pushes new content to the history.
     * @param content The content to push to the history
     */
    pushHistory(content: Content): void

    /**
     * Pushes new spots to the onSpotAddition callback.
     * @param spots The spots to push
     */
    pushSpot(spots: Spot[]): void

    /** Ends the current generation */
    endGeneration(): void

    /** Starts the generation process */
    startGeneration(): void

    /**
     * Sends a message to the AI and handles the response.
     * @param message The user's message
     * @param files Optional files to include with the message
     * @returns A promise that resolves when the message has been sent and processed
     */
    sendMessage(message: string, files: FileUpload[]): Promise<void>

    /**
     * Handles the incoming message stream from the AI.
     * @param response The async generator yielding parts of the response
     */
    handleMessage(response: AsyncGenerator<GenerateContentResponse>): Promise<void>

    /**
     * Handles tool calls made by the AI during the chat.
     * @param calls The function calls made by the AI
     * @param context The context for the tool calls
     */
    handleToolCalls(calls: FunctionCall[], context: CallableToolRequestContext): Promise<Part[]>
}