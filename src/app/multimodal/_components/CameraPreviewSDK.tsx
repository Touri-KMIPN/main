"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  RefreshCwIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import { TouriLiveSDK } from "@/services/client/TouriLiveService";
import { Base64 } from "js-base64";
import { cn } from "@/lib/utils";

interface CameraPreviewSDKProps {
  onTranscription: (text: string) => void;
}

export default function CameraPreviewSDK({
  onTranscription,
}: CameraPreviewSDKProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const geminiRef = useRef<TouriLiveSDK | null>(null);
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

   useEffect(() => {
     // Jalankan hanya jika kamera sedang streaming
     if (isStreaming && stream) {
       // 1. Matikan stream yang sedang berjalan
       stream.getTracks().forEach((track) => track.stop());

       // 2. Minta stream baru dengan camFacing yang sudah diperbarui
       // (Kita 'mencuri' logika dari fungsi toggleCamera-mu)
       const getNewStream = async () => {
         try {
           const videoStream = await navigator.mediaDevices.getUserMedia({
             video: {
               facingMode: camFacing, // Pakai state camFacing yang baru
             },
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

           const combinedStream = new MediaStream([
             ...videoStream.getTracks(),
             ...audioStream.getTracks(),
           ]);

           if (videoRef.current) {
             videoRef.current.srcObject = combinedStream;
           }

           // Update state stream agar konsisten
           setStream(combinedStream);
         } catch (err) {
           console.error("[CameraSDK] Error flipping camera:", err);
         }
       };

       getNewStream();
     }
     // Dependency array: Kode ini akan berjalan setiap kali 'camFacing' berubah
   }, [camFacing]);

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
    if (geminiRef.current) {
      geminiRef.current.disconnect();
      geminiRef.current = null;
    }
  }, []);

  const sendAudioData = (b64Data: string) => {
    if (!geminiRef.current) return;
    geminiRef.current.sendMediaChunk(b64Data, "audio/pcm;rate=16000");
  };

  const toggleCamera = async () => {
    if (isStreaming && stream) {
      setIsStreaming(false);
      cleanupWebSocket();
      cleanupAudio();
      stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
    } else {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          // video: true,
          video: {
            facingMode: camFacing,
          },
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

        audioContextRef.current = new AudioContext({
          sampleRate: 16000,
        });

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
        console.error("[CameraSDK] Error accessing media devices:", err);
        cleanupAudio();
      }
    }
  };

  // Initialize SDK connection
  useEffect(() => {
    if (!isStreaming) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");
    geminiRef.current = new TouriLiveSDK(
      (text) => {
        console.log("[CameraSDK] Received text:", text);
      },
      () => {
        console.log("[CameraSDK] Live session ready");
        setIsWebSocketReady(true);
        setConnectionStatus("connected");
      },
      (isPlaying) => setIsModelSpeaking(isPlaying),
      (level) => setOutputAudioLevel(level),
      []
    );
    geminiRef.current.connect();

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

  // Start image capture only after SDK is ready
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
          console.error("[CameraSDK] Audio setup error", error);
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
    if (!videoRef.current || !videoCanvasRef.current || !geminiRef.current) {
      console.warn("[CameraSDK] Missing refs for image capture:", {
        video: !!videoRef.current,
        canvas: !!videoCanvasRef.current,
        gemini: !!geminiRef.current
      });
      return;
    }

    const video = videoRef.current;
    const canvas = videoCanvasRef.current;
    
    // Check if video is ready
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("[CameraSDK] Video not ready for capture:", {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("[CameraSDK] Could not get canvas context");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      const b64Data = imageData.split(",")[1];
      
      console.log("[CameraSDK] Capturing and sending image:", {
        width: canvas.width,
        height: canvas.height,
        dataLength: b64Data.length
      });
      
      geminiRef.current.sendMediaChunk(b64Data, "image/jpeg");
    } catch (error) {
      console.error("[CameraSDK] Error capturing image:", error);
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
                  ? "Connecting to Gemini..."
                  : "Disconnected"}
              </p>
              <p className="text-white/70 text-sm">
                Please wait while we establish a secure connection
              </p>
            </div>
          </div>
        )}

        {/* <Button
          onClick={toggleCamera}
          size="icon"
          className={`absolute left-1/2 bottom-4 -translate-x-1/2 rounded-full w-12 h-12 backdrop-blur-sm transition-colors
            ${
              isStreaming
                ? "bg-red-500/50 hover:bg-red-500/70 text-white"
                : "bg-green-500/50 hover:bg-green-500/70 text-white"
            }
          `}
        >
          {isStreaming ? (
            <VideoOffIcon className="h-6 w-6" />
          ) : (
            <VideoIcon className="h-6 w-6" />
          )}
        </Button> */}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border justify-center bg-background/80 px-2.5 py-2 shadow-md backdrop-blur-lg">
            {/* Start Video Call */}
            <Button
              onClick={toggleCamera}
              className={cn(
                "cursor-pointer h-12 w-12 rounded-full",
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
              onClick={() => {
                setCamFacing(camFacing === "user" ? "environment" : "user");
              }}
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
