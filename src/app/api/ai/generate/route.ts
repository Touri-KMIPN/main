import { Part } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { TouriChatService } from "@/services/server/TouriChatService";
import { CallableTool_2 } from "@/types/tool";
import {
  GetUserLocationTool,
  ReverseGeocodingTool,
  SearchPlaceTools,
} from "@/tools/MapTools";
import {
  GenerateRequestBodySchema,
  GenerateRequestHeaderSchema,
} from "@/app/api/ai/generate/schemas";
import { createSSEChunk } from "@/app/api/ai/generate/utils";
import { $mongoClient } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const TOOLS: CallableTool_2[] = [
  SearchPlaceTools,
  GetUserLocationTool,
  ReverseGeocodingTool,
];

export async function POST(request: NextRequest) {
  // Validate headers
  const headers = GenerateRequestHeaderSchema.safeParse(
    Object.fromEntries(request.headers)
  );
  if (!headers.success) {
    return new Response(
      JSON.stringify({ error: "Invalid headers", details: headers.error }),
      { status: 400 }
    );
  }

  try {
    const { getUser } = await getKindeServerSession();
    const user = await getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    console.log(headers)

    // Validate body
    const body = GenerateRequestBodySchema.safeParse(await request.json());
    if (!body.success) {
      return new Response(
        JSON.stringify({ error: "Invalid body", details: body.error }),
        { status: 400 }
      );
    }

    // Instantiate a TextEncoder to encode strings to Uint8Array
    const encoder = new TextEncoder();

    // Create a ReadableStream to stream the response
    const readableStream = new ReadableStream({
      async start(controller) {
        // Use the Google GenAI SDK to generate content based on the request body

        const touriChatService = new TouriChatService({
          sessionId: headers.data.sessionid ?? null,
          onSpotAddition: (spots) => {
            controller.enqueue(
              encoder.encode(
                createSSEChunk({
                  spots,
                } as Part)
              )
            );
          },
          user,
          tools: TOOLS,
          onResponseStream: (chunk) => {
            controller.enqueue(
              encoder.encode(
                createSSEChunk({
                  text: chunk,
                } as Part)
              )
            );
          },
          onResponseEnd: () => {
            /** OnResponseEnd */
          },
          onResponseStart: () => {
            /** OnResponseStart */
          },
          onThoughtStream: (thought) => {
            controller.enqueue(
              encoder.encode(
                createSSEChunk({
                  thoughtProcess: thought,
                } as Part)
              )
            );
          },
          async onGenerationStart() {
            /** OnGenerationStart */
            try {
              await $mongoClient.connect();
            } catch (error) {
              console.error("MongoDB connection error:", error);
            }
          },
          async onGenerationEnd() {
            /** OnGenerationEnd */
            try {
              controller.enqueue(
                encoder.encode(
                  createSSEChunk({
                    finished: true,
                  } as Part)
                )
              );
            } catch (error) {
              console.error("MongoDB disconnection error:", error);
            }

            controller.close();
          },
          onSessionCreation: (session) => {
            /** OnSessionCreation */
            controller.enqueue(
              encoder.encode(
                createSSEChunk({
                  sessionId: session.id,
                } as Part)
              )
            );
          },
          onHistoryChange(_) {
            /** OnHistoryChange */
          },
          onHistoryPush(_) {
            /** OnHistoryPush */
          },
        });

        await touriChatService.sendMessage(
          body.data.text,
          body.data.files || []
        );
      },
    });

    // Return the ReadableStream as a streaming response
    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in /api/ai/generate:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
