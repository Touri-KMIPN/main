import { type FunctionDeclaration, type FunctionCall } from "@google/genai"

export interface CallableToolRequestContext {
    geoLocation?: {
        lat?: string,
        lng?: string
    },
    caller: "live" | "chat",
    [key: string]: unknown
}

/**
 * !!!DEPRECATED!!!: Use CallableTool_2 instead
 */
export interface CallableTool {
    requestSchema?: z.ZodObject<any>, 
    declaration: FunctionDeclaration,
    validate?: (args: FunctionCall["args"]) => z.SafeParseReturnType<any, any>,
    execute: (args: FunctionCall["args"]) => Promise<Record<string, unknown>>;
}

/**
 * Callable tool with direct schema definition
 */
export interface CallableTool_2 {
    /**
     * The name of the tool.
     */
    name: string,
    /**
     * A brief description of what the tool does.
     */
    description: string,
    /**
     * The Zod schema defining the structure of the tool's input parameters.
     */
    schema?: z.ZodObject<any>,
    /**
     * A function to validate the tool's input parameters.
     */
    validate?: (args: FunctionCall["args"]) => z.SafeParseReturnType<any, any>,
    /**
     * Executes the tool with the given arguments and context. (Called from server)
     * @param args The arguments to pass to the tool.
     * @param context The context in which the tool is being executed.
     * @returns The result of the tool execution.
     */
    execute: (args: FunctionCall["args"], context: CallableToolRequestContext) => Promise<Record<string, unknown>>;
    /**
     * Executes the tool with the given arguments. (Called from client)
     * @param args The arguments to pass to the tool.
     * @returns The result of the tool execution.
     */
    liveExecute: (args: FunctionCall["args"]) => Promise<Record<string, unknown>>;
}