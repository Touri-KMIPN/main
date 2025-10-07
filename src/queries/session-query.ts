import { ContentDocument } from "@/database/collections/contents";
import { SessionDocument } from "@/database/collections/sessions";
import { useQuery } from "@tanstack/react-query"

export const useSessionMessagesQuery = (
    sessionId?: string,
    initialLoad?: boolean,
) => {
    return useQuery({
        queryKey: ['session', sessionId, "messages"],
        queryFn: async () => {
            const response = await fetch(`/api/ai/session/${sessionId}/messages`);
            if (!response.ok) {
                throw new Error('Failed to fetch session messages: ' + response.statusText);
            }

            const parsedResponse = await response.json();

            return parsedResponse.messages as ContentDocument[];
        },
        enabled: !!sessionId && !initialLoad, // Only run if sessionId is provided and it's not the initial load
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