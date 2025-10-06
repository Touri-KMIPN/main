export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1]; // Remove the data URL prefix
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

export function base64ToFile(base64: string, mimeType: string, filename?: string): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    if (!filename) {
        filename = 'file';
    }

    if (!mimeType) {
        mimeType = 'application/octet-stream';
    }

    return new File([ab], filename, {type: mimeType});
}