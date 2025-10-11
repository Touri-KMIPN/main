"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  RefreshCwIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import { TouriClientLiveService } from "@/ai/services/client/TouriClientLiveService";
import { useSpots } from "@/providers/SpotsProvider";
import { Spot } from "@/types/spot";
import { Base64 } from "js-base64";
import { cn } from "@/lib/utils";

interface CameraPreviewNeoProps {
  onTranscription: (text: string) => void;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function CameraPreviewNeo({
  onTranscription,
}: CameraPreviewNeoProps) {
  const { setSpots } = useSpots();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const touriClientRef = useRef<TouriClientLiveService | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const [isAudioSetup, setIsAudioSetup] = useState(false);
  const setupInProgressRef = useRef(false);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const imageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [outputAudioLevel, setOutputAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [camFacing, setCamFacing] = useState<"user" | "environment">("user");
  const [isCanFlipCamera, setIsCanFlipCamera] = useState(false);

  const flipCamera = async () => {
    if (!stream || !isStreaming) return;

    // 1. Stop and remove current video track
    const currentVideoTrack = stream.getVideoTracks()[0];
    if (currentVideoTrack) {
      currentVideoTrack.stop();
      stream.removeTrack(currentVideoTrack);
    }

    // Wait for hardware to be released
    await delay(100);

    // 2. Determine new camera mode
    const newFacingMode = camFacing === "user" ? "environment" : "user";

    try {
      // 3. Request new camera stream
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });

      const newVideoTrack = newVideoStream.getVideoTracks()[0];

      // 4. Add new track to existing stream
      stream.addTrack(newVideoTrack);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 5. Update state
      setCamFacing(newFacingMode);
    } catch (err) {
      console.error(
        `[CameraPreviewNeo] Failed to access ${newFacingMode} camera:`,
        err
      );
      alert(
        "Failed to flip camera. Please try again or ensure no other app is using the camera."
      );
    }
  };

  const cleanupAudio = useCallback(() => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const cleanupWebSocket = useCallback(() => {
    if (touriClientRef.current) {
      touriClientRef.current.disconnect();
      touriClientRef.current = null;
    }
  }, []);

  const sendAudioData = (b64Data: string) => {
    if (!touriClientRef.current) return;
    touriClientRef.current.sendMediaChunk(b64Data, "audio/pcm;rate=16000");
  };

  const toggleCamera = async () => {
    // Turn OFF camera
    if (isStreaming && stream) {
      setIsStreaming(false);
      cleanupWebSocket();
      cleanupAudio();
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsCanFlipCamera(false);
    }
    // Turn ON camera
    else {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: camFacing },
          audio: false,
        });

        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
          },
        });

        // Check for multiple cameras after permissions are granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        if (videoDevices.length > 1) {
          setIsCanFlipCamera(true);
        }

        audioContextRef.current = new AudioContext({ sampleRate: 16000 });

        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.muted = true;
        }

        const combinedStream = new MediaStream([
          ...videoStream.getTracks(),
          ...audioStream.getTracks(),
        ]);

        setStream(combinedStream);
        setIsStreaming(true);
      } catch (err) {
        console.error("[CameraPreviewNeo] Error accessing media devices:", err);
        cleanupAudio();
      }
    }
  };

  // Initialize TouriClientLiveService connection
  useEffect(() => {
    if (!isStreaming) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");
    touriClientRef.current = new TouriClientLiveService(
      // onMessage - text responses
      (text) => {
        console.log("[CameraPreviewNeo] Received text:", text);
        onTranscription(text);
      },
      // onSetupComplete - connection ready
      () => {
        console.log("[CameraPreviewNeo] Touri Live service ready");
        setIsWebSocketReady(true);
        setConnectionStatus("connected");
      },
      // onPlayingStateChange - audio playback state
      (isPlaying) => setIsModelSpeaking(isPlaying),
      // onAudioLevelChange - audio level during playback
      (level) => setOutputAudioLevel(level),
      // onTranscription - transcription of AI responses
      (transcription) => {
        console.log("[CameraPreviewNeo] AI response transcription:", transcription);
        // You can handle transcription here if needed
      }
    );
    
    touriClientRef.current.connect();

    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
        imageIntervalRef.current = null;
      }
      cleanupWebSocket();
      setIsWebSocketReady(false);
      setConnectionStatus("disconnected");
    };
  }, [isStreaming, onTranscription, cleanupWebSocket]);

  // Start image capture only after service is ready
  useEffect(() => {
    if (!isStreaming || !isWebSocketReady) return;

    imageIntervalRef.current = setInterval(captureAndSendImage, 1000);

    return () => {
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
        imageIntervalRef.current = null;
      }
    };
  }, [isStreaming, isWebSocketReady]);

  // Audio processing setup
  useEffect(() => {
    if (
      !isStreaming ||
      !stream ||
      !audioContextRef.current ||
      !isWebSocketReady ||
      isAudioSetup ||
      setupInProgressRef.current
    )
      return;

    let isActive = true;
    setupInProgressRef.current = true;

    const setupAudioProcessing = async () => {
      try {
        const ctx = audioContextRef.current;
        if (!ctx || ctx.state === "closed" || !isActive) {
          setupInProgressRef.current = false;
          return;
        }

        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        await ctx.audioWorklet.addModule("/worklets/audio-processor.js");

        if (!isActive) {
          setupInProgressRef.current = false;
          return;
        }

        audioWorkletNodeRef.current = new AudioWorkletNode(
          ctx,
          "audio-processor",
          {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            processorOptions: {
              sampleRate: 16000,
              bufferSize: 4096,
            },
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "speakers",
          }
        );

        const source = ctx.createMediaStreamSource(stream);
        audioWorkletNodeRef.current.port.onmessage = (event) => {
          if (!isActive || isModelSpeaking) return;
          const { pcmData, level } = event.data;
          setAudioLevel(level);

          const pcmArray = new Uint8Array(pcmData);
          const b64Data = Base64.fromUint8Array(pcmArray);
          sendAudioData(b64Data);
        };

        source.connect(audioWorkletNodeRef.current);
        setIsAudioSetup(true);
        setupInProgressRef.current = false;

        return () => {
          source.disconnect();
          if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.disconnect();
          }
          setIsAudioSetup(false);
        };
      } catch (error) {
        if (isActive) {
          console.error("[CameraPreviewNeo] Audio setup error", error);
          cleanupAudio();
          setIsAudioSetup(false);
        }
        setupInProgressRef.current = false;
      }
    };

    setupAudioProcessing();

    return () => {
      isActive = false;
      setIsAudioSetup(false);
      setupInProgressRef.current = false;
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
      }
    };
  }, [isStreaming, stream, isWebSocketReady, isModelSpeaking]);

  const captureAndSendImage = () => {
    if (!videoRef.current || !videoCanvasRef.current || !touriClientRef.current) {
      console.warn("[CameraPreviewNeo] Missing refs for image capture:", {
        video: !!videoRef.current,
        canvas: !!videoCanvasRef.current,
        touriClient: !!touriClientRef.current
      });
      return;
    }

    const video = videoRef.current;
    const canvas = videoCanvasRef.current;
    
    // Check if video is ready
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("[CameraPreviewNeo] Video not ready for capture:", {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("[CameraPreviewNeo] Could not get canvas context");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      const b64Data = imageData.split(",")[1];
      
      console.log("[CameraPreviewNeo] Capturing and sending image:", {
        width: canvas.width,
        height: canvas.height,
        dataLength: b64Data.length
      });
      
      touriClientRef.current.sendMediaChunk(b64Data, "image/jpeg");
    } catch (error) {
      console.error("[CameraPreviewNeo] Error capturing image:", error);
    }
  };

  return (
    <div className="">
      <div className="relative overflow-hidden bg-muted md:rounded-lg h-dvh w-dvw">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute top-[50%] left-[50%] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
        />

        {isStreaming && connectionStatus !== "connected" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
              <p className="text-white font-medium">
                {connectionStatus === "connecting"
                  ? "Connecting to Touri Live..."
                  : "Disconnected"}
              </p>
              <p className="text-white/70 text-sm">
                Please wait while we establish a secure connection
              </p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border justify-center bg-background/80 px-2.5 py-2 shadow-md backdrop-blur-lg">
            {/* Start Video Call */}
            <Button
              onClick={toggleCamera}
              className={cn(
                "cursor-pointer h-12 w-12 rounded-full transition-colors",
                isStreaming
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-primary text-primary-foreground hover:bg-primary/70"
              )}
              title="Start Video Call"
            >
              {isStreaming ? (
                <VideoOffIcon className="h-5 w-5" aria-hidden />
              ) : (
                <VideoIcon className="h-5 w-5" aria-hidden />
              )}
            </Button>

            <Button
              onClick={flipCamera}
              disabled={!isCanFlipCamera || !isStreaming}
              className="h-12 w-12 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/70"
              title="Rotate Camera"
            >
              <RefreshCwIcon className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Indicator */}
      <div className="fixed inset-x-0 top-0 w-full pt-4">
        <div className="bg-green-200 h-2 w-[90dvw] rounded-full mx-auto">
          {isStreaming && (
            <div
              className="h-full rounded-full transition-all bg-green-500"
              style={{
                width: `${isModelSpeaking ? outputAudioLevel : audioLevel}%`,
                transition: "width 100ms ease-out",
              }}
            />
          )}
        </div>
      </div>

      <canvas ref={videoCanvasRef} className="hidden" />
    </div>
  );
}