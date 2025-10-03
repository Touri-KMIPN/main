import { type FunctionDeclaration, type FunctionCall } from "@google/genai"

export interface Tool {
    declaration: FunctionDeclaration,
    execute: (args: FunctionCall["args"]) => Promise<Record<string, unknown>>;
}