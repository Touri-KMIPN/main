import { Part } from "@google/genai"
import { NextRequest, NextResponse } from "next/server";
import { TouriChatService } from "@/services/server/TouriChatService";
import { CallableTool_2 } from "@/types/tool";
import { GetUserLocationTool, ReverseGeocodingTool, SearchPlaceTools } from "@/tools/MapTools";
import {GenerateRequestBodySchema, GenerateRequestHeaderSchema} from "@/app/api/ai/generate/schemas";
import {createSSEChunk} from "@/app/api/ai/generate/utils";


const TOOLS: CallableTool_2[] = [SearchPlaceTools,GetUserLocationTool,ReverseGeocodingTool]

export async function POST(request: NextRequest) {
    // Validate headers
    const headers = GenerateRequestHeaderSchema.safeParse(Object.fromEntries(request.headers))
    if (!headers.success) {
        return new Response(JSON.stringify({ error: 'Invalid headers', details: headers.error }), { status: 400 })
    }

    try {
        // Validate body
        const body = GenerateRequestBodySchema.safeParse(await request.json())
        if (!body.success) {
            return new Response(JSON.stringify({ error: 'Invalid body', details: body.error }), { status: 400 })
        }

        // Instantiate a TextEncoder to encode strings to Uint8Array
        const encoder = new TextEncoder()

        // Create a ReadableStream to stream the response
        const readableStream = new ReadableStream({
            async start(controller) {
                // Use the Google GenAI SDK to generate content based on the request body

                const touriChatService = new TouriChatService(
                    {
                        caller: "chat",
                        geoLocation: (headers.data.geolat && headers.data.geolng && headers.data.geolat.trim() && headers.data.geolng.trim()) ? {
                            lat: headers.data.geolat.toString(),
                            lng: headers.data.geolng.toString()
                        } : undefined
                    },
                    TOOLS,
                    (spots) => {
                        /** OnSpotAddition */
                        controller.enqueue(encoder.encode(createSSEChunk({
                            spots
                        } as Part)));
                    },
                    (_) => {
                        /** OnMemoryChange */
                    },
                    (_) => {
                        /** OnMemoryChangePush */
                    },
                    (chunk) => {
                        /** OnResponseStream */
                        controller.enqueue(encoder.encode(createSSEChunk({
                            text: chunk,
                        } as Part)));
                    },
                    () => {
                        /** OnResponseStart */
                    },
                    () => {
                        /** OnResponseEnd */
                    },
                    () => { },
                    () => {
                        /** OnGenerationEnd */
                        controller.enqueue(encoder.encode(createSSEChunk({
                            finished: true
                        } as Part)));
                        controller.close();
                    },
                    (thought) => {
                        /** OnThoughtStream */
                        controller.enqueue(encoder.encode(createSSEChunk({
                            thoughtProcess: thought
                        } as Part)));
                    }
                )

                await touriChatService.sendMessage(body.data.text, body.data.files || [])

            },
        })

        // Return the ReadableStream as a streaming response
        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
            status: 200,
        })
    } catch (error) {
        console.error('Error in /api/ai/generate:', error)
        return NextResponse.json({
            error: 'Internal Server Error',
            details: (error as Error).message,
        }, { status: 500 })
    }
}