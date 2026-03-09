import { Queue } from "./queue.js";
const MESSAGES_LENGTH = 30;

const callback = async (message) => {
    setTimeout(() => {console.log(message)}, 1000);
}

const queue = new Queue('my_queue', callback, 3);

console.log(queue);

for(let i = 0; i < MESSAGES_LENGTH; i++) {
    queue.addTask(`task ${i}`);
  }
