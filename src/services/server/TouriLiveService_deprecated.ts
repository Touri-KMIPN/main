import {
    LiveConnectConfig,
    MediaResolution,
    Modality,
    Session,
    GoogleGenAI,
    LiveServerMessage,
    FunctionCall,
    VertexAISearch
} from "@google/genai";
import {CallableTool_2} from "@/types/tool";
import {Spot} from "@/types/spot";
import {GetUserLocationTool, ReverseGeocodingTool, SearchPlaceTools} from "@/tools/MapTools";

const MODEL = "gemini-live-2.5-flash-preview";
const SYSTEM_PROMPT = `
                Your name is Touri, an AI voice assistant for a tourism app.
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
                - Never make up place IDs or information - only use data from tool responses
                - Be concise, informative, and enthusiastic in your responses

                **Examples:**
                - "show me restaurants" → use get_nearby_place with includedTypes: ["restaurant"]
                - "find historical places" → use search_place with textQuery: "historical sites museums landmarks"
                - "where am I?" → use get_user_location or get_geolocation_info
                - "what's the best pizza place?" → use search_place with textQuery: "best pizza restaurant"
                `


const CONFIG = {
    responseModalities: [Modality.AUDIO],
    mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
    speechConfig: {
        voiceConfig: {
            prebuiltVoiceConfig: {
                voiceName: "Zephyr",
            },
        },
    },
    contextWindowCompression: {
        triggerTokens: "25600",
        slidingWindow: {targetTokens: "12800"},
    },
    systemInstruction: SYSTEM_PROMPT,
    tools: [
    ]
} satisfies LiveConnectConfig;

export class TouriLiveSDK {
    session: Session | null = null;
    isConnected: boolean = false;
    ai: GoogleGenAI;
    isSetupComplete: boolean = false;
    onMessageCallback: ((text: string) => void) | null = null;
    onSetupCompleteCallback: (() => void) | null = null;
    audioContext: AudioContext | null = null;
    tools: Map<string, CallableTool_2> = new Map();

    // Audio queue management
    audioQueue: Float32Array[] = [];
    isPlaying: boolean = false;
    currentSource: AudioBufferSourceNode | null = null;
    isPlayingResponse: boolean = false;
    onPlayingStateChange: ((isPlaying: boolean) => void) | null = null;
    onAudioLevelChange: ((level: number) => void) | null = null;
    onSpotsAddition: ((spots: Spot[]) => void) | null = null;
    accumulatedPcmData: string[] = [];

    // TODO: Class Level RAG Implementation
    constructor(
        onMessage: (text: string) => void,
        onSetupComplete: () => void,
        onPlayingStateChange: (isPlaying: boolean) => void,
        onAudioLevelChange: (level: number) => void,
        onSpotsAddition: (spots: Spot[]) => void,
        tools: CallableTool_2[]
    ) {
        this.ai = new GoogleGenAI({
            // NOTE: For production use Ephemeral tokens; this mirrors existing client-side usage
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
            
        });
        this.onMessageCallback = onMessage;
        this.onSetupCompleteCallback = onSetupComplete;
        this.onPlayingStateChange = onPlayingStateChange;
        this.onAudioLevelChange = onAudioLevelChange;
        this.onSpotsAddition = onSpotsAddition;
        // Create AudioContext for playback (24kHz output)
        this.audioContext = new AudioContext({sampleRate: 24000});

        tools
            .concat([SearchPlaceTools, GetUserLocationTool, ReverseGeocodingTool]) // always include all map tools
            .filter((tool) => tool.name != null)
            .forEach((tool) => this.tools.set(tool.name!, tool));
    }

    async connect() {
        if (this.session || this.isConnected) {
            return;
        }

        const that = this;

        this.session = await this.ai.live.connect({
            model: MODEL,
            callbacks: {
                onopen() {
                    that.isConnected = true;
                    that.isSetupComplete = true;
                    console.log("[SDK] WebSocket connected");
                    that.onSetupCompleteCallback?.();
                },
                onclose(e) {
                    that.isConnected = false;
                    that.isSetupComplete = false;
                    console.log("[SDK] WebSocket disconnected", e?.reason ?? "");
                },
                async onmessage(message) {
                    try {
                        console.log("[SDK] Received message:", message);
                        await that.handleMessage(message);
                    } catch (err) {
                        console.error("[SDK] Error handling message:", err);
                    }
                },
                onerror(e) {
                    that.isConnected = false;
                    console.error("[SDK] WebSocket error occurred", e);
                },
            },
            config: CONFIG,
        });
    }

    // Send media chunk (audio/image). Audio must be PCM16, 16kHz mono, base64-encoded.
    sendMediaChunk(b64Data: string, mimeType: string) {
        if (!this.isConnected || !this.session || !this.isSetupComplete) {
            console.warn("[SDK] Cannot send media chunk - not connected:", {
                isConnected: this.isConnected,
                hasSession: !!this.session,
                isSetupComplete: this.isSetupComplete
            });
            return;
        }

        try {
            console.log("[SDK] Sending media chunk:", {
                mimeType,
                dataLength: b64Data.length,
                isAudio: mimeType.startsWith("audio/"),
                isImage: mimeType.startsWith("image/")
            });

            if (mimeType.startsWith("audio/pcm")) {
                const audioMime = mimeType.includes("rate=")
                    ? mimeType
                    : "audio/pcm;rate=16000"; // ensure required rate
                this.session.sendRealtimeInput({
                    audio: {
                        data: b64Data,
                        mimeType: audioMime,
                    }
                });
                return;
            }

            // Handle images and other media types
            this.session.sendRealtimeInput({
                media: {
                    data: b64Data,
                    mimeType,
                }
            });
            
            console.log("[SDK] Successfully sent media chunk");
        } catch (error) {
            console.error("[SDK] Error sending media chunk:", error);
        }
    }

    // Decode and enqueue base64 PCM16 (24kHz output expected from model)
    async playAudioResponse(base64Data: string) {
        if (!this.audioContext) return;

        try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
            const pcmData = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);

            const float32Data = new Float32Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) float32Data[i] = pcmData[i] / 32768.0;

            this.audioQueue.push(float32Data);
            this.playNextInQueue();
        } catch (error) {
            console.error("[SDK] Error processing audio:", error);
        }
    }

    async playNextInQueue() {
        if (!this.audioContext || this.isPlaying || this.audioQueue.length === 0) return;

        try {
            this.isPlaying = true;
            this.isPlayingResponse = true;
            this.onPlayingStateChange?.(true);

            const float32Data = this.audioQueue.shift()!;

            // Compute simple RMS-ish level for UI
            let sum = 0;
            for (let i = 0; i < float32Data.length; i++) sum += Math.abs(float32Data[i]);
            const level = Math.min((sum / float32Data.length) * 100 * 5, 100);
            this.onAudioLevelChange?.(level);

            const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            this.currentSource = this.audioContext.createBufferSource();
            this.currentSource.buffer = audioBuffer;
            this.currentSource.connect(this.audioContext.destination);
            this.currentSource.onended = () => {
                this.isPlaying = false;
                this.currentSource = null;
                if (this.audioQueue.length === 0) {
                    this.isPlayingResponse = false;
                    this.onPlayingStateChange?.(false);
                }
                this.playNextInQueue();
            };
            this.currentSource.start();
        } catch (error) {
            console.error("[SDK] Error playing audio:", error);
            this.isPlaying = false;
            this.isPlayingResponse = false;
            this.onPlayingStateChange?.(false);
            this.currentSource = null;
            this.playNextInQueue();
        }
    }

    stopCurrentAudio() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch {
                // ignore
            }
            this.currentSource = null;
        }
        this.isPlaying = false;
        this.isPlayingResponse = false;
        this.onPlayingStateChange?.(false);
        this.audioQueue = [];
    }

    // Message handler for SDK Live responses
    async handleMessage(message: LiveServerMessage) {
        // Pass through text if any (rare in audio-only mode)
        try {
            // Prefer serverContent audio parts, and only fall back to message.data
            let playedAnyAudioFromServerContent = false;

            // Handle serverContent parts if present (parity with WS handling)
            const serverContent = message?.serverContent;
            if (serverContent) {
                const turn = serverContent.modelTurn;
                if (turn?.parts) {
                    for (const part of turn.parts) {
                        if (part?.inlineData?.mimeType?.startsWith("audio/pcm")) {
                            const data = part.inlineData.data;
                            if (typeof data === "string") {
                                this.accumulatedPcmData.push(data);
                                await this.playAudioResponse(data);
                                playedAnyAudioFromServerContent = true;
                            }
                        }
                        if (part?.text && this.onMessageCallback) {
                            this.onMessageCallback(part.text);
                        }
                    }
                }
            }

            // Some SDK live messages may include audio data directly on `data` as base64 PCM16 (24kHz).
            // Only use this if we didn't already play audio from serverContent to avoid duplicates.
            if (!playedAnyAudioFromServerContent && message?.data && typeof message.data === "string") {
                this.accumulatedPcmData.push(message.data);
                await this.playAudioResponse(message.data);
            }

            // Basic tool call handling (optional)
            if (message?.toolCall?.functionCalls) {
                for (const call of message.toolCall.functionCalls) {
                    const toolName = call.name ?? "";
                    const tool = this.tools.get(toolName);

                    if (!tool) {
                        this.session?.sendToolResponse({
                            functionResponses: [
                                {
                                    id: call.id,
                                    name: toolName,
                                    response: {error: `Tool "${toolName}" not found or not available.`},
                                }
                            ]
                        })

                        continue;
                    }

                    try {
                        const args = (call.args ?? {}) as FunctionCall["args"];
                        const result = await tool.liveExecute(args);
                        
                        // Check if the result contains spots and notify the callback
                        if (result.spots && Array.isArray(result.spots) && this.onSpotsAddition) {
                            this.onSpotsAddition(result.spots as Spot[]);
                        }
                        
                        this.session?.sendToolResponse({
                            functionResponses: [
                                {
                                    id: call.id,
                                    name: toolName,
                                    response: result,
                                }
                            ]
                        })


                    } catch (error) {
                        this.session?.sendToolResponse({
                            functionResponses: [
                                {
                                    id: call.id,
                                    name: toolName,
                                    response: {error: `Error executing tool "${toolName}": ${error}`},
                                }
                            ]
                        })
                    }
                }
            }
        } catch (error) {
            console.error("[SDK] Error parsing/handling message:", error);
        }
    }

    disconnect() {
        this.isSetupComplete = false;
        try {
            this.session?.close();
        } catch {
        }
        this.session = null;
        this.isConnected = false;
        this.accumulatedPcmData = [];
        this.stopCurrentAudio();
    }
}