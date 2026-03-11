import { isNil } from "./declarations/typeguards/isNil";
import { isQueueState } from "./declarations/typeguards/isQueueState";
import type { QueueCallback, QueueMessage, QueueState } from "./declarations/types";
import { FileStorage, getStorage } from "./storage";

export class Queue {
  private _name: string;
  private _callback: QueueCallback;
  private _maxTasks: number;
  private _activeTasks = 0;
  private _tasks: QueueMessage[] = [];
  private _storage: FileStorage = getStorage();

  constructor(name: string, callback: QueueCallback, maxTasks = 1) {
    this._name = name;
    this._callback = callback;
    this._maxTasks = maxTasks;
    this.init();
  }


  public addTask(task: QueueMessage): void {
    this._tasks.push(task);
    this.storeQueue();
    if (this.hasCapacity()) {
      this.crawl();
    }
  }

  private crawl() {
    if (this._tasks.length > 0) {
      this._activeTasks++;
      this._callback(this._tasks.shift()!).finally(() => {
        this.storeQueue();
        this._activeTasks--;
        this.crawl();
      });
    }
  }

  private hasCapacity() {
    return this._activeTasks < this._maxTasks;
  }

  private async init(): Promise<void> {
    const data: QueueState | null = await this.loadQueue();
    if(isNil(data)) {
      return;
    }

    this._tasks = data.tasks;
    while(this.hasCapacity()) {
      this.crawl();
    }
  }

  private async storeQueue(): Promise<void> {
    try {
      await this._storage.write(`${this._name}.json`, this.serialize());
    } catch (error) {
      console.error(`Error storing queue: ${error}`);
    }
  }

  private async loadQueue(): Promise<QueueState | null> {
    try {
      const data: Record<string, unknown> | null = await this._storage.read(`${this._name}.json`);
      if(isNil(data)) {
        return null;
      }
      return this.deserialize(data);
    } catch (error) {
      console.error(`Error loading queue: ${error}`);
      return null;
    }
  }

  private serialize(): string {
    return JSON.stringify({
      tasks: this._tasks,
      activeTasks: this._activeTasks,
      maxTasks: this._maxTasks
    });
  }

  private deserialize(data: Record<string, unknown>): QueueState {
    if(isQueueState(data)) {
      return data;
    }
    throw new Error(`Invalid stored tasks: ${JSON.stringify(data)}`);
  }
}
