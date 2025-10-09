import { Spot } from "@/types/spot"; // Make sure this path is correct

// Define the structure of the data chunks from your API
type StreamChunk =
    | { text: string }
    | { spots: Spot[] }
    | { finished: boolean }
    | { sessionId: string }

// A helper type for the base64 file format
interface Base64File {
    name: string;
    content: string; // base64 encoded content
    mimeType: string;
}

// Updated Interface
export interface ITouriClientChatService {
    sessionId: string | null;
    isGenerating: boolean;

    onResponseStart: () => void;
    onResponseEnd: () => void;
    onResponseStream: (chunk: string) => void;
    onSpotsAddition: (spots: Spot[]) => Promise<void>;

    sendMessage(message: string, files?: File[]): Promise<void>;
}

export class TouriClientChatService implements ITouriClientChatService {
    isGenerating: boolean = false;
    sessionId: string | null;
    onResponseStart: () => void;
    onResponseEnd: () => void;
    onResponseStream: (chunk: string) => void;
    onSpotsAddition: (spots: Spot[]) => Promise<void>;
    onSessionCreation: (sessionId: string) => void

    constructor(
        sessionId: string | null = null,
        callbacks: {
            onResponseStart?: () => void;
            onResponseEnd?: () => void;
            onResponseStream?: (chunk: string) => void;
            onSpotsAddition?: (spots: Spot[]) => Promise<void>;
            onSessionCreation?: (sessionId: string) => void;
        } = {}
    ) {
        this.sessionId = sessionId;
        this.onResponseStart = callbacks.onResponseStart ?? (() => {
        });
        this.onResponseEnd = callbacks.onResponseEnd ?? (() => {
        });
        this.onResponseStream = callbacks.onResponseStream ?? (() => {
        });
        this.onSpotsAddition = callbacks.onSpotsAddition ?? (async () => {
        });
        this.onSessionCreation = callbacks.onSessionCreation ?? (() => {
        });
    }

    /**
     * Converts a File object to a base64 encoded string.
     */
    private async _fileToBase64(file: File): Promise<Base64File> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1]; // Remove the data:*/*;base64, part
                resolve({
                    name: file.name,
                    content: base64String,
                    mimeType: file.type,
                });
            };
            reader.onerror = (error) => reject(error);
        });
    }

    private async getGeolocationInfo() {
        if (!navigator.geolocation) {
            return null;
        }

        return new Promise<{ lat: string; lng: string } | null>((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString(),
                    });
                },
                () => resolve(null), // On error, return null
                { timeout: 5000 } // Optional: set a timeout for geolocation
            );
        });
    }

    async sendMessage(message: string, files: File[] = []): Promise<void> {
        if (this.isGenerating) {
            console.warn("A message generation is already in progress.");
            return;
        }

        this.isGenerating = true;
        this.onResponseStart();
    
        try {
            // Convert files to the format expected by the backend
            const formattedFiles = await Promise.all(
                files.map(file => this._fileToBase64(file))
            );

            const geolocation = await this.getGeolocationInfo();

            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers like geolocation if needed
                    'sessionId': this.sessionId || '',
                    ...(geolocation ? { 'geolat': geolocation.lat, 'geolng': geolocation.lng } : {})

                },
                body: JSON.stringify({
                    text: message,
                    files: formattedFiles,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const messages = buffer.split('\n\n');
                buffer = messages.pop() || '';

                for (const msg of messages) {
                    if (msg.startsWith('data: ')) {
                        const jsonString = msg.substring(6);
                        const data = JSON.parse(jsonString) as StreamChunk;

                        // Call the appropriate callback based on the data shape
                        if ('text' in data) {
                            this.onResponseStream(data.text);
                        }
                        if ('sessionId' in data) {
                            this.sessionId = data.sessionId;
                            console.log("New session ID received:", data.sessionId);
                            this.onSessionCreation(data.sessionId)
                        }
                        if ('spots' in data) {
                             console.log("Spots received:", data.spots);
                             await this.onSpotsAddition(data.spots);
                         } 
                        if ('finished' in data && data.finished) {
                            // The stream is done, the finally block will handle the rest
                            return;
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Chat service failed:", error);
            // You might want to call a specific onError callback here
        } finally {
            this.isGenerating = false;
            this.onResponseEnd();
        }
    }
}