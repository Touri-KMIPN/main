import {ChatSession, Message} from "@/generated/prisma"
import {DbClient} from "@/lib/db";

interface IMemoryService {
    db: DbClient

    getSessions(): Promise<ChatSession[]>;

    getSessionById(sessionId: string): Promise<ChatSession | null>;

    getSessionMessages(sessionId: string): Promise<Message[]>;

    appendMessageToSession(sessionId: string, message: Message): Promise<void>;
}

export class MemoryService implements IMemoryService {
    db: DbClient;

    constructor(db: DbClient) {
        this.db = db;
    }

    getSessionById(sessionId: string): Promise<ChatSession | null> {
        const session = this.db.chatSession.findUnique({
            where: {id: sessionId},
        });

        return session ?? Promise.resolve(null);
    }

    getSessions(): Promise<ChatSession[]> {
        return this.db.chatSession.findMany();
    }

    getSessionMessages(sessionId: string): Promise<Message[]> {
        return this.db.message.findMany({
            where: {chatSessionId: sessionId},
            orderBy: {createdAt: 'asc'}
        });
    }

    appendMessageToSession(sessionId: string, message: Message): Promise<void> {
        return this.db.message.create({
            data: {
                chatSessionId: sessionId,
                role: message.role,
                content: message.content,
            }
        }).then(() => Promise.resolve());
    }

    deleteMessage(messageId: string): Promise<void> {
        return this.db.message.delete({
            where: {id: messageId},
        }).then(() => Promise.resolve());
    }
}