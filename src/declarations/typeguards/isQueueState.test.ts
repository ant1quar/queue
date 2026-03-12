import { describe, expect, test } from "bun:test";
import { isQueueState } from "./isQueueState";

describe("isQueueState", () => {
  test("returns true for valid QueueState", () => {
    expect(isQueueState({ tasks: [], activeTasks: 0, maxTasks: 1 })).toBe(true);
  });

  test("returns false for null", () => {
    expect(isQueueState(null as unknown as Record<string, unknown>)).toBe(false);
  });

  test("returns false for undefined", () => {
    expect(isQueueState(undefined as unknown as Record<string, unknown>)).toBe(false);
  });

  test("returns false when tasks is not array", () => {
    expect(isQueueState({ tasks: "not array", activeTasks: 0, maxTasks: 1 })).toBe(false);
  });

  test("returns false when activeTasks is not number", () => {
    expect(isQueueState({ tasks: [], activeTasks: "0", maxTasks: 1 })).toBe(false);
  });

  test("returns false when maxTasks is missing", () => {
    expect(isQueueState({ tasks: [], activeTasks: 0 } as Record<string, unknown>)).toBe(false);
  });

  test("returns false for empty object", () => {
    expect(isQueueState({})).toBe(false);
  });
});
