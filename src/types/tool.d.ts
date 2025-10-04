import { type FunctionDeclaration, type FunctionCall } from "@google/genai"
import {z} from "zod"

const schema = z.object({
    declaration: z.object({
        name: z.string(),
        description: z.string(),
    })
})

export interface Tool {
    requestSchema?: z.ZodObject<any>, 
    declaration: FunctionDeclaration,
    validate?: (args: FunctionCall["args"]) => z.SafeParseReturnType<any, any>,
    execute: (args: FunctionCall["args"]) => Promise<Record<string, unknown>>;
}