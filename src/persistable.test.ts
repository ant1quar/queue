import { describe, expect, test } from "bun:test";
import { Persistable } from "./persistable";

class TestPersistable extends Persistable {
  persistCalls = 0;
  protected async persist(): Promise<void> {
    this.persistCalls++;
  }
}

describe("Persistable", () => {
  test("SIGINT triggers persist on all instances", async () => {
    const p1 = new TestPersistable();
    const p2 = new TestPersistable();

    process.emit("SIGINT", "SIGINT");
    await new Promise((r) => setTimeout(r, 10));

    expect(p1.persistCalls).toBe(1);
    expect(p2.persistCalls).toBe(1);
  });

  test("SIGTERM triggers persist", async () => {
    const p = new TestPersistable();

    process.emit("SIGTERM", "SIGTERM");
    await new Promise((r) => setTimeout(r, 10));

    expect(p.persistCalls).toBe(1);
  });

  test("setShutdownComplete callback is invoked after persist", async () => {
    const p = new TestPersistable();
    let onCompleteCalled = false;
    Persistable.setShutdownComplete(() => {
      onCompleteCalled = true;
    });

    process.emit("SIGINT", "SIGINT");
    await new Promise((r) => setTimeout(r, 10));

    expect(p.persistCalls).toBe(1);
    expect(onCompleteCalled).toBe(true);
  });

  test("multiple instances all get persist called", async () => {
    const instances = [new TestPersistable(), new TestPersistable(), new TestPersistable()];

    process.emit("SIGINT", "SIGINT");
    await new Promise((r) => setTimeout(r, 10));

    instances.forEach((p) => expect(p.persistCalls).toBe(1));
  });
});
