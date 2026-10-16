import { describe, it, expect } from "vitest";
import { cn, formatDate } from "./index";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats an ISO string to a readable date", () => {
    const result = formatDate("2026-04-23T10:00:00.000Z");
    expect(result).toContain("2026");
    expect(result).toContain("Apr");
  });

  it("returns a non-empty string for any valid ISO date", () => {
    const result = formatDate(new Date().toISOString());
    expect(result.length).toBeGreaterThan(0);
  });
});
