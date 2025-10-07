import { ContentDocument } from "@/database/collections/contents";
import { SessionDocument } from "@/database/collections/sessions";
import { useQuery } from "@tanstack/react-query"

export const useSessionMessagesQuery = (
    sessionId?: string,
) => {
    return useQuery({
        queryKey: ['messages', sessionId],
        queryFn: async () => {
            const response = await fetch(`/api/ai/session/${sessionId}/messages`);
            if (!response.ok) {
                throw new Error('Failed to fetch session messages: ' + response.statusText);
            }

            const parsedResponse = await response.json();

            return parsedResponse.messages as ContentDocument[];
        },
        enabled: !!sessionId, // Only run if sessionId is provided
    });
}

export const useSessionsQuery = () => {
    return useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const response = await fetch(`/api/ai/session`);
            if (!response.ok) {
                throw new Error('Failed to fetch sessions: ' + response.statusText);
            }
            const parsedResponse = await response.json();
            return parsedResponse.sessions as SessionDocument[];
        },
        initialData: [],
    });
}

