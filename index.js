import { Queue } from "./queue.js";
const MESSAGES_LENGTH = 30;

const callback = async (message) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(message);
}

const queue = new Queue('my_queue', callback, 3);

console.log(queue);

for(let i = 0; i < MESSAGES_LENGTH; i++) {
    queue.addTask(`task ${i}`);
  }

setTimeout(() => {
    queue.addTask('task 30');
}, 1000);
