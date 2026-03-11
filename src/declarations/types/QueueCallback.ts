import type { QueueMessage } from "./QueueMessage";

export type QueueCallback = (message: QueueMessage) => Promise<void>;
