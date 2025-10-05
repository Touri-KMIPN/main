import {
  z,
  ZodTypeAny,
  ZodObject,
  ZodNumber,
  ZodString,
  ZodBoolean,
} from "zod";
import { FunctionDeclaration, Schema, Type } from "@google/genai";

/**
 * Recursively converts a Zod schema type to a Google Generative AI Schema.
 * This final version correctly handles descriptions on wrapped schemas.
 * @param zodSchema - The Zod schema type to convert.
 * @returns The corresponding Schema object.
 */
function convertZodType(zodSchema: ZodTypeAny): Schema {
  // 1. Read the description from the original schema FIRST.
  // This is the key fix.
  const description = zodSchema.description;

  // 2. Determine the core (unwrapped) schema type.
  const unwrappedSchema = (zodSchema as any).unwrap
    ? (zodSchema as any).unwrap()
    : zodSchema;

  // 3. Build the base Schema object, now with the correct description.
  const baseSchema: Schema = {};
  if (description) {
    baseSchema.description = description;
  }

  // 4. Handle the specific Zod type
  if (unwrappedSchema instanceof ZodObject) {
    const properties: Record<string, Schema> = {};
    const required: string[] = [];

    for (const key in unwrappedSchema.shape) {
      const fieldSchema = unwrappedSchema.shape[key];
      properties[key] = convertZodType(fieldSchema);
      if (!fieldSchema.isOptional()) {
        required.push(key);
      }
    }

    return {
      ...baseSchema,
      type: Type.OBJECT,
      properties,
      ...(required.length > 0 && { required }),
    };
  } else if (unwrappedSchema instanceof ZodNumber) {
    return {
      ...baseSchema,
      type: unwrappedSchema.isInt ? Type.INTEGER : Type.NUMBER,
    };
  } else if (unwrappedSchema instanceof ZodString) {
    return { ...baseSchema, type: Type.STRING };
  } else if (unwrappedSchema instanceof ZodBoolean) {
    return { ...baseSchema, type: Type.BOOLEAN };
  }

  throw new Error(`Unsupported Zod type: ${unwrappedSchema.constructor.name}`);
}

// Main function remains the same
export function zodToFunctionDeclaration({
  name,
  description,
  schema,
}: {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
}): FunctionDeclaration {
  let parameters;
  if (schema) {
    if (!(schema instanceof ZodObject)) {
      throw new Error("Schema must be a ZodObject");
    }
    parameters = convertZodType(schema);
  }

  return {
    name,
    description,
    parameters,
  };
}
