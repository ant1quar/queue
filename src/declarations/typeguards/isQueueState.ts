import type { QueueState } from "../types";
import { isNil } from "./isNil";

export function isQueueState(data: Record<string, unknown>): data is QueueState {
    return !(isNil(data)
    || typeof data !== 'object' 
    || !Array.isArray(data.tasks)
    || typeof data.maxTasks !== 'number'
    || typeof data.activeTasks !== 'number')
}