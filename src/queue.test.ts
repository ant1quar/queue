import { describe, expect, test } from "bun:test";
import type { QueueCallback, QueueMessage } from "./declarations/types";
import { Queue } from "./queue";
import type { FileStorage } from "./storage";

function createMockStorage() {
  const written: { path: string; data: string }[] = [];
  let readData: Record<string, unknown> | null = null;

  const storage: FileStorage = {
    async write(path: string, data: string) {
      written.push({ path, data });
    },
    async read(_path: string) {
      return readData;
    },
  };

  return {
    storage,
    get written() {
      return written;
    },
    set readData(value: Record<string, unknown> | null) {
      readData = value;
    },
    get readData() {
      return readData;
    },
  };
}

describe("Queue", () => {
  test("addTask invokes callback with message", async () => {
    const mock = createMockStorage();
    const processed: QueueMessage[] = [];
    const callback: QueueCallback = async (msg) => {
      processed.push(msg);
    };

    const queue = new Queue("test", callback, 1, mock.storage);
    await queue.ready();

    queue.addTask("hello");
    await new Promise((r) => setTimeout(r, 50));

    expect(processed).toContain("hello");
  });

  test("addTask with maxTasks=1 runs tasks sequentially", async () => {
    const mock = createMockStorage();
    const order: number[] = [];
    const callback: QueueCallback = async (msg) => {
      order.push(Number((msg as string).split("-")[1]));
      await new Promise((r) => setTimeout(r, 10));
    };

    const queue = new Queue("test", callback, 1, mock.storage);
    await queue.ready();

    queue.addTask("task-1");
    queue.addTask("task-2");
    queue.addTask("task-3");
    await new Promise((r) => setTimeout(r, 50));

    expect(order).toEqual([1, 2, 3]);
  });

  test("addTask with maxTasks=3 runs up to 3 tasks in parallel", async () => {
    const mock = createMockStorage();
    const started: number[] = [];
    const callback: QueueCallback = async (msg) => {
      const id = Number((msg as string).split("-")[1]);
      started.push(id);
      await new Promise((r) => setTimeout(r, 50));
    };

    const queue = new Queue("test", callback, 3, mock.storage);
    await queue.ready();

    queue.addTask("task-1");
    queue.addTask("task-2");
    queue.addTask("task-3");
    await new Promise((r) => setTimeout(r, 20));

    expect(started.length).toBe(3);
    expect(started).toContain(1);
    expect(started).toContain(2);
    expect(started).toContain(3);
  });

  test("storeQueue called after addTask", async () => {
    const mock = createMockStorage();
    const callback: QueueCallback = async () => {};

    const queue = new Queue("my_queue", callback, 1, mock.storage);
    await queue.ready();

    queue.addTask("task1");
    await new Promise((r) => setTimeout(r, 10));

    expect(mock.written.length).toBeGreaterThan(0);
    const last = mock.written[mock.written.length - 1]!;
    expect(last.path).toBe("my_queue.json");
    const parsed = JSON.parse(last.data);
    expect(parsed).toHaveProperty("tasks");
    expect(parsed).toHaveProperty("activeTasks");
    expect(parsed).toHaveProperty("maxTasks");
  });

  test("callback rejection does not break queue", async () => {
    const mock = createMockStorage();
    const processed: QueueMessage[] = [];
    const callback: QueueCallback = async (msg) => {
      processed.push(msg);
      if ((msg as string) === "fail") throw new Error("callback error");
    };

    const queue = new Queue("test", callback, 1, mock.storage);
    await queue.ready();

    queue.addTask("ok");
    queue.addTask("fail");
    queue.addTask("ok2");
    await new Promise((r) => setTimeout(r, 100));

    expect(processed).toContain("ok");
    expect(processed).toContain("fail");
    expect(processed).toContain("ok2");
    expect(mock.written.length).toBeGreaterThan(0);
  });

  test("restores from storage when readData has valid QueueState", async () => {
    const mock = createMockStorage();
    mock.readData = { tasks: ["a", "b"], activeTasks: 0, maxTasks: 2 };

    const processed: QueueMessage[] = [];
    const callback: QueueCallback = async (msg) => {
      processed.push(msg);
      await new Promise((r) => setTimeout(r, 5));
    };

    const queue = new Queue("test", callback, 2, mock.storage);
    await queue.ready();

    await new Promise((r) => setTimeout(r, 50));

    expect(processed).toContain("a");
    expect(processed).toContain("b");
  });

  test("handles invalid read data gracefully", async () => {
    const mock = createMockStorage();
    mock.readData = { tasks: "not array", activeTasks: 0, maxTasks: 1 };

    const processed: QueueMessage[] = [];
    const callback: QueueCallback = async (msg) => {
      processed.push(msg);
      await new Promise((r) => setTimeout(r, 5));
    };

    const queue = new Queue("test", callback, 1, mock.storage);
    await queue.ready();

    queue.addTask("new");
    await new Promise((r) => setTimeout(r, 50));

    expect(processed).toContain("new");
    expect(mock.written.length).toBeGreaterThan(0);
  });
});
