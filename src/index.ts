import type { QueueCallback, QueueMessage } from "./declarations/types";

import { Queue } from "./queue.ts";

const MESSAGES_LENGTH = 30;

const callback: QueueCallback = async (message: QueueMessage) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(message);
};

const queue = new Queue("my_queue", callback, 3);

console.log(queue);

for (let i = 0; i < MESSAGES_LENGTH; i++) {
  queue.addTask(`task ${i}`);
}