const TOURI_LIVE_ENDPOINT = process.env.NEXT_PUBLIC_TOURI_LIVE_ENDPOINT || "ws://localhost:8000/touri/live";

export class TouriClientLiveService {
    private ws: WebSocket | null = null;
    private isConnected: boolean = false;
    private isSetupComplete: boolean = false;
    private onMessageCallback: ((text: string) => void) | null = null;
    private onSetupCompleteCallback: (() => void) | null = null;
    private audioContext: AudioContext | null = null;

    // Audio queue management with sample rate info
    private audioQueue: { data: Float32Array; sampleRate: number }[] = [];
    private isPlaying: boolean = false;
    private currentSource: AudioBufferSourceNode | null = null;
    private isPlayingResponse: boolean = false;
    private onPlayingStateChange: ((isPlaying: boolean) => void) | null = null;
    private onAudioLevelChange: ((level: number) => void) | null = null;
    private onTranscriptionCallback: ((text: string) => void) | null = null;
    private accumulatedPcmData: string[] = [];

    constructor(
        onMessage: (text: string) => void, 
        onSetupComplete: () => void,
        onPlayingStateChange: (isPlaying: boolean) => void,
        onAudioLevelChange: (level: number) => void,
        onTranscription: (text: string) => void
    ) {
        this.onMessageCallback = onMessage;
        this.onSetupCompleteCallback = onSetupComplete;
        this.onPlayingStateChange = onPlayingStateChange;
        this.onAudioLevelChange = onAudioLevelChange;
        this.onTranscriptionCallback = onTranscription;
        // Create AudioContext for playback
        this.audioContext = new AudioContext({
            sampleRate: 24000  // Match Gemini Live's response audio rate (24kHz)
        });
    }

    connect() {
        if (this.isConnected) {
            console.warn("WebSocket is already connected.");
            return;
        }

        this.ws = new WebSocket(TOURI_LIVE_ENDPOINT);

        this.ws.onopen = () => {
            console.log("WebSocket connection established.");
            this.isConnected = true;
        };

        this.ws.onmessage = async (event) => {
            try {
                let messageText: string;
                if (event.data instanceof Blob) {
                    const arrayBuffer = await event.data.arrayBuffer();
                    const bytes = new Uint8Array(arrayBuffer);
                    messageText = new TextDecoder('utf-8').decode(bytes);
                } else {
                    messageText = event.data;
                }
                
                await this.handleMessage(messageText);
            } catch (error) {
                console.error("[TouriLive] Error processing message:", error);
            }
        };

        this.ws.onerror = (error) => {
            console.error("[TouriLive] WebSocket error:", error);
        };

        this.ws.onclose = (event) => {
            this.isConnected = false;
            this.isSetupComplete = false;
            
            // Only attempt to reconnect if we haven't explicitly called disconnect
            if (!event.wasClean && this.isSetupComplete) {
                setTimeout(() => this.connect(), 1000);
            }
        };
    }

    sendMediaChunk(b64Data: string, mimeType: string = "audio/pcm;rate=16000") {
        if (!this.isConnected || !this.ws || !this.isSetupComplete) {
            console.warn("[TouriLive] Cannot send media chunk - not ready");
            return;
        }

        // Determine message type based on MIME type
        const messageType = mimeType.startsWith('image/') ? 'image-chunk' : 'audio-chunk';
        
        const message = {
            type: messageType,
            data: b64Data,
            mimeType: mimeType
        };

        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error("[TouriLive] Error sending media chunk:", error);
        }
    }

    async handleMessage(message: string) {
        try {
            const messageData = JSON.parse(message);
            
            console.log("[TouriLive] Received message:", messageData);

            switch (messageData.type) {
                case 'ready':
                    this.isSetupComplete = true;
                    this.onSetupCompleteCallback?.();
                    break;

                case 'text':
                    if (messageData.text && this.onMessageCallback) {
                        this.onMessageCallback(messageData.text);
                    }
                    break;

                case 'audio':
                    if (messageData.data) {
                        this.accumulatedPcmData.push(messageData.data);
                        // Parse sample rate from mimeType if available
                        const sampleRate = this.parseSampleRate(messageData.mimeType) || 24000;
                        await this.playAudioResponse(messageData.data, sampleRate);
                    }
                    break;

                case 'error':
                    console.error("[TouriLive] Server error:", messageData.message);
                    break;

                case 'pong':
                    // Handle ping/pong if needed
                    break;

                default:
                    console.warn("[TouriLive] Unknown message type:", messageData.type);
            }
        } catch (error) {
            console.error("[TouriLive] Error parsing message:", error);
        }
    }

    // Helper method to parse sample rate from MIME type
    private parseSampleRate(mimeType?: string): number | null {
        if (!mimeType) return null;
        const match = mimeType.match(/rate=(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }

    private async playAudioResponse(base64Data: string, sampleRate: number = 24000) {
        if (!this.audioContext) return;

        try {
            // Decode base64 to bytes
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert to Int16Array (PCM format)
            const pcmData = new Int16Array(bytes.buffer);
            
            // Convert to float32 for Web Audio API
            const float32Data = new Float32Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
                float32Data[i] = pcmData[i] / 32768.0;
            }

            // Add to queue with sample rate info and start playing if not already playing
            this.audioQueue.push({ data: float32Data, sampleRate });
            this.playNextInQueue();
        } catch (error) {
            console.error("[TouriLive] Error processing audio:", error);
        }
    }

    private async playNextInQueue() {
        if (!this.audioContext || this.isPlaying || this.audioQueue.length === 0) return;

        try {
            this.isPlaying = true;
            this.isPlayingResponse = true;
            this.onPlayingStateChange?.(true);
            const audioItem = this.audioQueue.shift()!;
            const { data: float32Data, sampleRate } = audioItem;

            // Calculate audio level
            let sum = 0;
            for (let i = 0; i < float32Data.length; i++) {
                sum += Math.abs(float32Data[i]);
            }
            const level = Math.min((sum / float32Data.length) * 100 * 5, 100);
            this.onAudioLevelChange?.(level);

            const audioBuffer = this.audioContext.createBuffer(
                1,
                float32Data.length,
                sampleRate  // Use the actual sample rate from the audio data
            );
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
            console.error("[TouriLive] Error playing audio:", error);
            this.isPlaying = false;
            this.isPlayingResponse = false;
            this.onPlayingStateChange?.(false);
            this.currentSource = null;
            this.playNextInQueue();
        }
    }

    private stopCurrentAudio() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            this.currentSource = null;
        }
        this.isPlaying = false;
        this.isPlayingResponse = false;
        this.onPlayingStateChange?.(false);
        this.audioQueue = []; // Clear queue
    }

    // Method to send a ping to keep connection alive
    sendPing() {
        if (!this.isConnected || !this.ws) return;
        
        const message = { type: 'ping' };
        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error("[TouriLive] Error sending ping:", error);
        }
    }

    // Method to stop audio playback
    stopAudio() {
        this.stopCurrentAudio();
    }

    // Check if currently playing audio response
    get isPlayingAudioResponse(): boolean {
        return this.isPlayingResponse;
    }

    // Get connection status
    get connected(): boolean {
        return this.isConnected && this.isSetupComplete;
    }

    disconnect() {
        this.isSetupComplete = false;
        this.stopCurrentAudio();
        
        if (this.ws) {
            this.ws.close(1000, "Intentional disconnect");
            this.ws = null;
        }
        this.isConnected = false;
        this.accumulatedPcmData = [];
        
        // Close audio context if needed
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}