# CameraPreviewNeo vs CameraPreviewSDK Comparison

This document compares the new `CameraPreviewNeo` component (using `TouriClientLiveService`) with the original `CameraPreviewSDK` component (using `TouriLiveSDK`).

## Key Differences

### Service Layer
| Feature | CameraPreviewSDK | CameraPreviewNeo |
|---------|------------------|------------------|
| Service | `TouriLiveSDK` (direct server SDK) | `TouriClientLiveService` (WebSocket client) |
| Connection | Direct Google AI API | Via Deno server (touri-live) |
| Architecture | Client → Google AI | Client → WebSocket → Deno Server → Google AI |

### Constructor Changes

**Old (CameraPreviewSDK):**
```typescript
geminiRef.current = new TouriLiveSDK(
  (text) => { ... },           // onTextResponse
  () => { ... },               // onSetupComplete  
  (isPlaying) => { ... },      // onPlayingStateChange
  (level) => { ... },          // onAudioLevelChange
  (spots: Spot[]) => { ... },  // onSpotsReceived - SPECIFIC TO OLD
  []                           // Additional parameter
);
```

**New (CameraPreviewNeo):**
```typescript
touriClientRef.current = new TouriClientLiveService(
  (text) => { ... },           // onMessage
  () => { ... },               // onSetupComplete
  (isPlaying) => { ... },      // onPlayingStateChange  
  (level) => { ... },          // onAudioLevelChange
  (transcription) => { ... }   // onTranscription - GENERIC
);
```

### Spots Handling

**Old:** Spots were handled directly in the service constructor:
```typescript
(spots: Spot[]) => {
  console.log("[CameraSDK] Received spots:", spots);
  setSpots(prev => prev.concat(spots));
}
```

**New:** Spots handling would need to be implemented in the server or through text parsing:
```typescript
// Spots would come through text responses or need server-side processing
(text) => {
  console.log("[CameraPreviewNeo] Received text:", text);
  onTranscription(text);
  // Could parse spots from text or implement server-side spots processing
}
```

## Migration Steps

### 1. Update Imports
```typescript
// OLD
import { TouriLiveSDK } from "@/services/server/TouriLiveService";

// NEW  
import { TouriClientLiveService } from "@/services/client/TouriClientLiveService";
```

### 2. Update Ref Names
```typescript
// OLD
const geminiRef = useRef<TouriLiveSDK | null>(null);

// NEW
const touriClientRef = useRef<TouriClientLiveService | null>(null);
```

### 3. Update Service Initialization
```typescript
// OLD
geminiRef.current = new TouriLiveSDK(onText, onSetup, onPlaying, onLevel, onSpots, []);

// NEW
touriClientRef.current = new TouriClientLiveService(onText, onSetup, onPlaying, onLevel, onTranscription);
```

### 4. Handle Spots Differently
- **Option A:** Implement spots parsing in the client from text responses
- **Option B:** Add spots handling to the Deno server
- **Option C:** Use a separate service for spots functionality

## Environment Setup

### Required Environment Variables

**CameraPreviewNeo requires:**
```bash
NEXT_PUBLIC_TOURI_LIVE_ENDPOINT=ws://localhost:8000/touri/live
```

**Deno server requires:**
```bash
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

### Server Dependency
- **CameraPreviewSDK:** Works standalone with direct API access
- **CameraPreviewNeo:** Requires `touri-live` Deno server to be running

## Usage Example

```typescript
// In your component file
import CameraPreviewNeo from "@/app/multimodal/_components/CameraPreviewNeo";

function MyComponent() {
  const handleTranscription = (text: string) => {
    console.log("Transcription:", text);
  };

  return (
    <CameraPreviewNeo onTranscription={handleTranscription} />
  );
}
```

## Starting the Server

Before using `CameraPreviewNeo`, ensure the Deno server is running:

```bash
cd touri-live
deno task dev
```

The server will start on `http://localhost:8000` and provide the WebSocket endpoint at `ws://localhost:8000/touri/live`.

## Benefits of CameraPreviewNeo

1. **Separation of Concerns:** Client and server logic are separated
2. **Scalability:** Server can handle multiple clients
3. **Security:** API keys are kept server-side
4. **Flexibility:** Server can add additional processing, logging, etc.
5. **Protocol Abstraction:** WebSocket protocol can be enhanced without client changes

## Considerations

1. **Additional Complexity:** Requires running a separate server
2. **Network Dependency:** Client depends on WebSocket connection to server
3. **Latency:** Additional hop through WebSocket might add minimal latency
4. **Spots Feature:** Needs to be reimplemented or moved to server-side