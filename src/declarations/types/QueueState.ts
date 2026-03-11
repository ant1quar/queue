import type { QueueMessage } from "./QueueMessage";

export type QueueState = {
  tasks: QueueMessage[];
  activeTasks: number;
  maxTasks: number;
};