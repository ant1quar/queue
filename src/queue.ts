import { isNil } from "./declarations/typeguards/isNil";
import { isQueueState } from "./declarations/typeguards/isQueueState";
import type { QueueCallback, QueueMessage, QueueState } from "./declarations/types";
import { Persistable } from "./persistable";
import { FileStorage, getStorage } from "./storage";
//Класс который реализует очередь задач.
// Persistable нужен для реакции на сигналы завершения работы - записи очереди в файл.
// В тз "состояние очереди должно быть записано в файл". Не совсем понятно что такое состояние - сейчас я сохраняю все задачи, activeTasks и maxTasks.
// Но на момент следующего вызова maxTasks может быть изменен. Поэтому я не использую их после инициализации.
//ready - для того, чтобы можно было дождаться инициализации очереди перед тестами.
//Идея для доработки - добавить состояние задачам pending, processing. - так будет понятно над какими задачами работает очередь в момент записи в файл.
//Да, JSON.stringify потеряетфункции, если таском будет объект с методами. Но по тз пока не важен тип. можем доработать позже.
export class Queue extends Persistable {
  private _name: string;
  private _callback: QueueCallback;
  private _maxTasks: number;
  private _activeTasks = 0;
  private _tasks: QueueMessage[] = [];
  private _storage: FileStorage;
  private _readyPromise: Promise<void>;

  constructor(name: string, callback: QueueCallback, maxTasks = 1, storage?: FileStorage) {
    super();
    this._name = name;
    this._callback = callback;
    this._maxTasks = maxTasks;
    this._storage = storage ?? getStorage();
    this._readyPromise = this.init();
  }

  ready(): Promise<void> {
    return this._readyPromise;
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
      this._callback(this._tasks.shift()!)
        .catch((err) => console.error(`Error in queue callback: ${err}`))
        .finally(() => {
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

  protected async persist(): Promise<void> {
    await this.storeQueue();
  }
}
