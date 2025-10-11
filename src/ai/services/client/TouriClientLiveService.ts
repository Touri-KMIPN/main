const TOURI_LIVE_ENDPOINT = process.env.NEXT_PUBLIC_TOURI_LIVE_ENDPOINT || "ws://localhost:8000/touri/live";

export class TouriClientLiveService {
    private ws: WebSocket | null = null;
    private isConnected: boolean = false;
    private isSetupComplete: boolean = false;
    private audioContext: AudioContext | null = null;
    private authToken: string | null = null;
    private tokenExpiresAt: Date | null = null;
    private isRefreshingToken: boolean = false;
    private tokenRefreshInterval: NodeJS.Timeout | null = null;

    // Audio queue management with sample rate info
    private audioQueue: { data: Float32Array; sampleRate: number }[] = [];

    private isPlaying: boolean = false;
    private currentSource: AudioBufferSourceNode | null = null;
    private isPlayingResponse: boolean = false;
    private accumulatedPcmData: string[] = [];

    private onMessageCallback: ((text: string) => void) | null = null;
    private onSetupCompleteCallback: (() => void) | null = null;
    private onPlayingStateChange: ((isPlaying: boolean) => void) | null = null;
    private onAudioLevelChange: ((level: number) => void) | null = null;
    private onTranscriptionCallback: ((text: string) => void) | null = null;
    private onAuthenticatedCallback: ((success: boolean) => void) | null = null;
    constructor(
        onMessage: (text: string) => void,
        onSetupComplete: () => void,
        onPlayingStateChange: (isPlaying: boolean) => void,
        onAudioLevelChange: (level: number) => void,
        onTranscription: (text: string) => void,
        onAuthenticated?: (success: boolean) => void
    ) {
        this.onMessageCallback = onMessage;
        this.onSetupCompleteCallback = onSetupComplete;
        this.onPlayingStateChange = onPlayingStateChange;
        this.onAudioLevelChange = onAudioLevelChange;
        this.onTranscriptionCallback = onTranscription;
        this.onAuthenticatedCallback = onAuthenticated || null;
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

        // First fetch an ephemeral token before connecting
        this.fetchEphemeralToken()
            .then(token => {
                this.authToken = token;
                this.establishWebSocketConnection();
            })
            .catch(error => {
                console.error("[TouriLive] Failed to fetch ephemeral token:", error);
                // You might want to call an error callback here
            });
    }

    private async fetchEphemeralToken(): Promise<string> {
        try {
            const response = await fetch('/api/auth/ephemeral-token', {
                method: 'GET',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.token) {
                throw new Error('No token received from server');
            }

            // Store token expiration time for refresh logic
            if (data.expiresAt) {
                this.tokenExpiresAt = new Date(data.expiresAt);
            }

            console.log("[TouriLive] Ephemeral token fetched successfully, expires at:", this.tokenExpiresAt);
            return data.token;
        } catch (error) {
            console.error("[TouriLive] Error fetching ephemeral token:", error);
            throw error;
        }
    }

    private shouldRefreshToken(): boolean {
        if (!this.tokenExpiresAt) return false;

        // Refresh token 5 minutes before it expires
        const refreshThreshold = new Date(this.tokenExpiresAt.getTime() - 5 * 60 * 1000);
        return new Date() >= refreshThreshold;
    }

    private async refreshTokenIfNeeded(): Promise<void> {
        if (!this.shouldRefreshToken() || this.isRefreshingToken) {
            return;
        }

        this.isRefreshingToken = true;

        try {
            console.log("[TouriLive] Refreshing token...");
            this.authToken = await this.fetchEphemeralToken();
            console.log("[TouriLive] Token refreshed successfully");
        } catch (error) {
            console.error("[TouriLive] Failed to refresh token:", error);
            // If token refresh fails, we might need to reconnect
            this.disconnect();
        } finally {
            this.isRefreshingToken = false;
        }
    }

    private sendInitialSetup() {
        if (!this.isConnected || !this.ws) {
            console.warn("[TouriLive] WebSocket is not connected.");
            return;
        }

        const setupMessage = {
            type: "setup",
            token: this.authToken,
        };

        this.ws.send(JSON.stringify(setupMessage));
    }

    private establishWebSocketConnection() {
        if (!this.authToken) {
            console.error("[TouriLive] Cannot establish connection without auth token");
            return;
        }

        // Create WebSocket URL with protocol handling
        const wsUrl = TOURI_LIVE_ENDPOINT.replace(/^http/, 'ws');

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log("WebSocket connection established.");
            this.isConnected = true;

            // Send Setup Message
            this.sendInitialSetup()

            // Start token refresh monitoring
            this.startTokenRefreshMonitoring();
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
            this.stopTokenRefreshMonitoring();

            console.log("[TouriLive] WebSocket closed:", event.code, event.reason);

            // Check for authentication failures
            if (event.code === 1008) {
                console.error("[TouriLive] Authentication failed:", event.reason);

                // Try to refresh token and reconnect if it was a token expiration issue
                if (event.reason?.includes('Token expired') || event.reason?.includes('Authentication failed')) {
                    console.log("[TouriLive] Attempting to refresh token and reconnect...");
                    this.authToken = null; // Force token refresh
                    this.tokenExpiresAt = null;
                    setTimeout(() => this.connect(), 2000); // Retry connection after 2 seconds
                }
                return;
            }

            // Only attempt to reconnect if we haven't explicitly called disconnect
            if (!event.wasClean && this.isSetupComplete) {
                setTimeout(() => this.connect(), 1000);
            }
        };
    }

    sendMediaChunk(b64Data: string, mimeType: string = "audio/pcm;rate=16000") {
        // Check for token refresh before sending data
        this.refreshTokenIfNeeded();

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
                case 'authenticated':
                    if (this.onAuthenticatedCallback) {
                        this.onAuthenticatedCallback(true);
                    }
                    break;
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

    private startTokenRefreshMonitoring() {
        // Check every minute for token refresh
        this.tokenRefreshInterval = setInterval(() => {
            this.refreshTokenIfNeeded();
        }, 60 * 1000);
    }

    private stopTokenRefreshMonitoring() {
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
            this.tokenRefreshInterval = null;
        }
    }

    disconnect() {
        this.isSetupComplete = false;
        this.stopCurrentAudio();
        this.stopTokenRefreshMonitoring();

        if (this.ws) {
            this.ws.close(1000, "Intentional disconnect");
            this.ws = null;
        }
        this.isConnected = false;
        this.accumulatedPcmData = [];
        this.authToken = null;
        this.tokenExpiresAt = null;

        // Close audio context if needed
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}