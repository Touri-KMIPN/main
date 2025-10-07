import { ContentDocument, contentsCollection } from "@/database/collections/contents";
import { SessionDocument, sessionsCollection } from "@/database/collections/sessions";

interface ISessionService {
    getSessions(): Promise<SessionDocument[]>;

    createSession(summary: string, userId: string): Promise<SessionDocument>;

    getSessionById(sessionId: string): Promise<SessionDocument | null>;

    getSessionMessages(sessionId: string): Promise<ContentDocument[]>;

    getUserSession(userId: string): Promise<SessionDocument[]>;

    appendContentToSession(sessionId: string, content: ContentDocument): Promise<void>;
}

export class SessionService implements ISessionService {
    async getSessions(): Promise<SessionDocument[]> {
        return sessionsCollection.find().toArray()
    }

    async getUserSession(userId: string): Promise<SessionDocument[]> {
        return await sessionsCollection.find({ userId }).toArray();
    }

    async getSessionById(sessionId: string): Promise<SessionDocument | null> {
        return sessionsCollection.findOne({ id: sessionId });
    }

    async createSession(summary: string, userId: string): Promise<SessionDocument> {
        const newSession: SessionDocument = {
            id: crypto.randomUUID(),
            userId,
            summary,
            createdAt: new Date(),
        };

        await sessionsCollection.insertOne(newSession);

        return newSession;
    }

    async getSessionMessages(sessionId: string): Promise<ContentDocument[]> {
        return contentsCollection.find({ sessionId }).sort({ createdAt: 1 }).toArray();
    }

    async appendContentToSession(sessionId: string, content: ContentDocument): Promise<void> {
        await contentsCollection.insertOne({ ...content, sessionId });
    }
}