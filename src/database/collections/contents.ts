import { $mongo } from "@/lib/db";
import { Content } from "@google/genai";

export interface ContentDocument extends Content {
    sessionId: string;
    createdAt: Date;
}

export const contentsCollection = $mongo.collection<ContentDocument>('contents')