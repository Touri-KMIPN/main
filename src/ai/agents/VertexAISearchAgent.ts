import { ai, GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_PROJECT_ID } from "../ai";
import z from "zod";
import { BaseAgent } from "./abstract";

const COLLECTION = "default_collection"
const TRIVIA_DATASTORE = process.env.GOOGLE_VERTEXAI_TRIVIA_DATASTORE || "trivia_datastore"
const SITE_CRAWL_DATASTORE = process.env.GOOGLE_VERTEXAI_SITE_CRAWL_DATASTORE || "site_crawl_datastore"

export class VertexAISearchAgent extends BaseAgent {
    readonly name = "vertex_ai_search";
    readonly description = `
    Use this tool to search for comprehensive tourism information with intelligent source selection.
    
    PRIMARY USE: Tourism knowledge from curated databases (Vertex AI Search)
    - Indonesian destinations, culture, history, and traditions
    - Tourist attractions, landmarks, temples, museums
    - Local cuisine, cultural practices, travel guides
    - General tourism information and established travel tips
    
    SECONDARY USE: Real-time information when needed (Google Search)
    - Flight schedules, prices, and availability
    - Hotel rates and current availability
    - Weather conditions and forecasts
    - Transportation schedules and current prices
    - Recent events, festivals, or temporary closures
    - Currency rates and current travel restrictions
    
    The tool automatically prioritizes curated tourism content over web search to avoid information overload while providing access to real-time data when necessary.
    `;
    readonly schema = z.object({
        query: z.string().min(1).max(500).describe("The search query for tourism information. Can include requests for both established knowledge and real-time information."),
    });

    protected async run(args: z.infer<typeof this.schema>) {
        const { query } = args;

        // Try different datastore path formats based on Vertex AI Search documentation
        const triviaDatastorePath = `projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/collections/${COLLECTION}/dataStores/${TRIVIA_DATASTORE}`;
        const siteCrawlDatastorePath = `projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/collections/${COLLECTION}/dataStores/${SITE_CRAWL_DATASTORE}`;

        return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: query }],
            config: {
                systemInstruction: `You are a helpful assistant specializing in tourism information with access to both curated tourism knowledge and real-time search capabilities.

                TOOL USAGE PRIORITY:
                1. **PRIMARY: Use Vertex AI Search** for established tourism content:
                - Indonesian destinations, culture, history, traditions
                - Tourist attractions, landmarks, temples, museums
                - Local cuisine, cultural practices, travel guides
                - General tourism information and tips
                - Historical and cultural sites information
                - Regional specialties and local experiences

                2. **SECONDARY: Use Google Search** ONLY for real-time/latest information:
                - Flight schedules, prices, and availability
                - Hotel rates, availability, and recent reviews
                - Current weather conditions and forecasts
                - Transportation schedules and ticket prices
                - Recent events, festivals, or temporary closures
                - Currency exchange rates
                - Latest news affecting travel (natural disasters, strikes, etc.)

                IMPORTANT GUIDELINES:
                - Always prioritize Vertex AI Search for tourism knowledge and cultural information
                - Only use Google Search when the query explicitly requires real-time, current, or frequently changing information
                - If both sources provide relevant information, prioritize Vertex AI Search results and supplement with Google Search only for time-sensitive details
                - Combine information from both sources when appropriate, clearly indicating which information comes from which source`,
                tools: [
                    {
                        retrieval: {
                            vertexAiSearch: {
                                datastore: triviaDatastorePath
                            }
                        }
                    },
                    {
                        retrieval: {
                            vertexAiSearch: {
                                datastore: siteCrawlDatastorePath
                            }
                        }
                    },
                    {
                        googleSearch: {}
                    }
                ]
            }
        });
    }
}
