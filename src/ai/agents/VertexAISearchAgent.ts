import { ai, GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_PROJECT_ID } from "../ai";
import z from "zod";
import { BaseAgent } from "./abstract";

const COLLECTION = "default_collection"
const TRIVIA_DATASTORE = process.env.GOOGLE_VERTEXAI_TRIVIA_DATASTORE || "trivia_datastore"
const SITE_CRAWL_DATASTORE = process.env.GOOGLE_VERTEXAI_SITE_CRAWL_DATASTORE || "site_crawl_datastore"

export class VertexAISearchAgent extends BaseAgent {
    readonly name = "vertex_ai_search";
    readonly description = "Use this tool to search for relevant information from your knowledge base using Vertex AI Search. Useful for answering questions about Indonesian tourism, culture, and travel information.";
    readonly schema = z.object({
        query: z.string().min(1).max(500).describe("The search query to find relevant information about Indonesian tourism, culture, or travel."),
    });

    protected async run(args: z.infer<typeof this.schema>) {
        const { query } = args;
        console.log("Running Vertex AI Search with query:", query);
        
        // Try different datastore path formats based on Vertex AI Search documentation
        const triviaDatastorePath = `projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/collections/${COLLECTION}/dataStores/${TRIVIA_DATASTORE}`;
        const siteCrawlDatastorePath = `projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/collections/${COLLECTION}/dataStores/${SITE_CRAWL_DATASTORE}`;
        
        return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: query }],
            config: {
                systemInstruction: `You are a helpful assistant specializing in Indonesian tourism information. Use the retrieved data to provide accurate, detailed information about Indonesian destinations, culture, history, and travel tips.`,
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
                    }
                ]
            }
        });
    }
}
