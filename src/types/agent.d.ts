import { z } from "zod";

/**
* Callable tool with direct schema definition
*/
export interface CallableAgent {
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
     * Execute the agent
     */
    execute: (args: any[]) => Promise<any>,
}
