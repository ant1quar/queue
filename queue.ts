export type QueueMessage = unknown;

export type QueueCallback = (message: QueueMessage) => Promise<void>;

export class Queue {
  private _name: string;
  private _callback: QueueCallback;
  private _maxTasks: number;
  private _activeTasks = 0;
  private _tasks: QueueMessage[] = [];
  private itWorks = false;

  constructor(name: string, callback: QueueCallback, maxTasks = 1) {
    this._name = name;
    this._callback = callback;
    this._maxTasks = maxTasks;
  }

  get name() {
    return this._name;
  }

  private _canWork() {
    return !this.itWorks || this._activeTasks < this._maxTasks;
  }

  addTask(task: QueueMessage) {
    this._tasks.push(task);
    if (this._canWork()) {
      this.crawl();
    }
  }

  private crawl() {
    if (this._tasks.length > 0) {
      this.itWorks = true;
      this._activeTasks++;
      this._callback(this._tasks.shift()!).finally(() => {
        this.itWorks = false;
        this._activeTasks--;
        this.crawl();
      });
    }
  }
}
