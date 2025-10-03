import { type Tool } from "@/types/tool";
import { Type, type FunctionDeclaration } from "@google/genai";

const declaration: FunctionDeclaration = {
    name: "get_current_time",
    description: "Get the current local time",
}

async function execute(_: Record<string, unknown> | undefined): Promise<Record<string, unknown>> {
    
    return {
        time: new Date().toLocaleTimeString()
    }
}

export const GetCurrentTimeTool: Tool = {
    declaration,
    execute
}
