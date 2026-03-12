import { describe, expect, test } from "bun:test";
import { isNil } from "./isNil";

describe("isNil", () => {
  test("returns true for undefined", () => {
    expect(isNil(undefined)).toBe(true);
  });

  test("returns true for null", () => {
    expect(isNil(null)).toBe(true);
  });

  test("returns false for 0", () => {
    expect(isNil(0)).toBe(false);
  });

  test("returns false for empty string", () => {
    expect(isNil("")).toBe(false);
  });

  test("returns false for false", () => {
    expect(isNil(false)).toBe(false);
  });

  test("returns false for empty object", () => {
    expect(isNil({})).toBe(false);
  });

  test("returns false for empty array", () => {
    expect(isNil([])).toBe(false);
  });
});
