// File Schema
import z from "zod";

export const FileSchema = z.object({
    name: z.string(),
    content: z.string(), // base64 encoded content
    mimeType: z.string()
})

// Request Body Validation
export const GenerateRequestBodySchema = z.object({
    text: z.string().min(1),
    files: z.array(FileSchema).optional()
})

// Request Header Validation
export const GenerateRequestHeaderSchema = z.object({
    geolat: z.string().optional(),
    geolng: z.string().optional(),
    sessionid: z.string().optional(),
})

export type GenerateRequestBody = z.infer<typeof GenerateRequestBodySchema>;
export type GenerateRequestHeaders = z.infer<typeof GenerateRequestHeaderSchema>;
export type FileUpload = z.infer<typeof FileSchema>
