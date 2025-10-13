export interface QueuedMessage {
  id: string;
  prompt: string;
  files: SerializableFile[]; // <-- Ubah dari File[] menjadi SerializableFile[]
  timestamp: string;
}

export interface SerializableFile {
  name: string;
  type: string;
  data: string; // Ini akan berisi Base64 data URL
}

const QUEUE_KEY = "messageQueue";

// Fungsi untuk mendapatkan semua pesan di antrean
export function getQueue(): QueuedMessage[] {
  const storedQueue = localStorage.getItem(QUEUE_KEY);
  return storedQueue ? JSON.parse(storedQueue) : [];
}

// Fungsi untuk menambahkan pesan baru ke antrean
export function addToQueue(message: Omit<QueuedMessage, 'id' | 'timestamp'>) {
  const queue = getQueue();
  const newMessage: QueuedMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  queue.push(newMessage);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return newMessage;
}

// Fungsi untuk mengosongkan antrean
export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}
