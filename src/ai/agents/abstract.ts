import { CallableAgent } from "@/types/agent";
import { GenerateContentResponse } from "@google/genai";
import z from "zod";

/**
 * Abstract base class for agents
 */
export abstract class BaseAgent implements CallableAgent {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly schema?: z.ZodObject<any>;

    /**
     * Validates the arguments against the schema
     */
    protected validateArgs(args: any) {
        if (!this.schema) {
            return args;
        }
        
        const validated = this.schema.safeParse(args);
        if (!validated.success) {
            throw new Error(`Invalid arguments: ${validated.error.message}`);
        }
        
        return validated.data;
    }

    /**
     * Execute the agent with validation
     */
    async execute(args: any): Promise<GenerateContentResponse> {
        const validatedArgs = this.validateArgs(args);
        return this.run(validatedArgs);
    }

    /**
     * Abstract method to be implemented by concrete agent classes
     */
    protected abstract run(args: any): Promise<GenerateContentResponse>;
}

