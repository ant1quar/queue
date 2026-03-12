import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileStorage } from "./storage";

describe("FileStorage", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "queue-storage-test-"));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test("write then read returns same JSON", async () => {
    const storage = new FileStorage();
    const path = join(testDir, "test.json");
    const data = JSON.stringify({ tasks: ["a", "b"], activeTasks: 0, maxTasks: 1 });

    await storage.write(path, data);
    const result = await storage.read(path);

    expect(result).toEqual({ tasks: ["a", "b"], activeTasks: 0, maxTasks: 1 });
  });

  test("read nonexistent file returns null", async () => {
    const storage = new FileStorage();
    const path = join(testDir, "nonexistent.json");

    const result = await storage.read(path);

    expect(result).toBe(null);
  });

  test("write to directory path throws", async () => {
    const storage = new FileStorage();
    const path = testDir; // writing to directory, not file

    await expect(storage.write(path, "{}")).rejects.toThrow();
  });
});
