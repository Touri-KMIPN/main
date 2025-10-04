import { type Tool } from "@/types/tool";
import { Type, type FunctionDeclaration } from "@google/genai";

const declaration: FunctionDeclaration = {
    name: "get_place_information",
    description: "Get information about a place, such as a city, a country, or a specific address.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            place: {
                type: Type.STRING,
                description: "The place to get information about."
            }
        },
        required: ["place"]
    }
}

async function execute(args: Record<string, unknown> | undefined): Promise<Record<string, unknown>> {
    if (!args || typeof args.place !== 'string') {
        throw new Error('Invalid arguments: place must be a string');
    }
    
    const { place } = args as { place: string };
    
    return {
        place: `This is a dummy response for ${place}. In a real application, this would return actual information.`
    }
}

export const PlaceTool: Tool = {
    declaration,
    execute
}
