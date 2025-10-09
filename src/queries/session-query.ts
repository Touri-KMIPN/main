import { ContentDocument } from "@/database/collections/contents";
import { SessionDocument } from "@/database/collections/sessions";
import { mutationOptions, MutationOptions, useMutation, useQuery } from "@tanstack/react-query"

export const useSessionMessagesQuery = (
    sessionId?: string,
    enabled?: boolean
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
        enabled: !!sessionId && !enabled, // Only run if sessionId is provided
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


export const deleteSessionMutationOpts = mutationOptions({
    mutationFn: async (sessionId: string) => {
            const response = await fetch(`/api/ai/session/${sessionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete session: ' + response.statusText);
            }

            return await response.json()
        },  
})
