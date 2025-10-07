import { $mongo } from "@/lib/db";

export interface SessionDocument {
    id: string;
    userId: string;
    summary: string;
    createdAt: Date;
}

export const sessionsCollection = $mongo.collection<SessionDocument>('sessions')