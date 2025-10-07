export function createSSEChunk(data: any) {
    return `data: ${JSON.stringify(data)}\n\n`;
}
