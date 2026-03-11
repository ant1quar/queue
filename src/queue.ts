import type { QueueCallback, QueueMessage } from "./declarations/types";

export class Queue {
  private _name: string;
  private _callback: QueueCallback;
  private _maxTasks: number;
  private _activeTasks = 0;
  private _tasks: QueueMessage[] = [];

  constructor(name: string, callback: QueueCallback, maxTasks = 1) {
    this._name = name;
    this._callback = callback;
    this._maxTasks = maxTasks;
  }

  private _hasCapacity() {
    return this._activeTasks < this._maxTasks;
  }

  addTask(task: QueueMessage) {
    this._tasks.push(task);
    if (this._hasCapacity()) {
      this.crawl();
    }
  }

  private crawl() {
    if (this._tasks.length > 0) {
      this._activeTasks++;
      this._callback(this._tasks.shift()!).finally(() => {
        this._activeTasks--;
        this.crawl();
      });
    }
  }
}
