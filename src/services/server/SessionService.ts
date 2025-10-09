import { ContentDocument, contentsCollection } from "@/database/collections/contents";
import { SessionDocument, sessionsCollection } from "@/database/collections/sessions";

interface ISessionService {
    getSessions(): Promise<SessionDocument[]>;

    createSession(sessionId: string, summary: string, userId: string): Promise<SessionDocument>;

    getSessionById(sessionId: string): Promise<SessionDocument | null>;

    getSessionMessages(sessionId: string): Promise<ContentDocument[]>;

    getUserSession(userId: string): Promise<SessionDocument[]>;

    appendContentToSession(sessionId: string, content: ContentDocument): Promise<void>;

    deleteSession: (sessionId: string) => Promise<void>;
}

export class SessionService implements ISessionService {
    async getSessions(): Promise<SessionDocument[]> {
        return sessionsCollection.find().toArray()
    }

    async getUserSession(userId: string): Promise<SessionDocument[]> {
        return await sessionsCollection.find({ userId }).sort({ createdAt: 1 }).toArray();
    }

    async getSessionById(sessionId: string): Promise<SessionDocument | null> {
        return sessionsCollection.findOne({ id: sessionId });
    }


    async createSession(sessionId: string, summary: string, userId: string): Promise<SessionDocument> {
        const newSession: SessionDocument = {
            id: sessionId,
            userId,
            summary,
            createdAt: new Date(),
        };

        await sessionsCollection.insertOne(newSession);

        return newSession;
    }

    async getSessionMessages(sessionId: string): Promise<ContentDocument[]> {
        // Sort by old message first
        return contentsCollection.find({ sessionId }).sort({ createdAt: 1 }).toArray();
    }

    async appendContentToSession(sessionId: string, content: Omit<ContentDocument, "createdAt">): Promise<void> {
        await contentsCollection.insertOne({ ...content, sessionId, createdAt: new Date() });
    }

    async deleteSession(sessionId: string): Promise<void> {
        await sessionsCollection.deleteOne({ id: sessionId })
    }
}