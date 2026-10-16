import { describe, it, expect } from "vitest";
import { postStore } from "./posts";

describe("postStore", () => {
  it("findAll returns paginated results", () => {
    const { data, total } = postStore.findAll(1, 5);
    expect(data.length).toBeLessThanOrEqual(5);
    expect(total).toBeGreaterThan(0);
  });

  it("findAll page 2 returns different items than page 1", () => {
    const page1 = postStore.findAll(1, 5);
    const page2 = postStore.findAll(2, 5);
    expect(page1.data[0]?.id).not.toBe(page2.data[0]?.id);
  });

  it("create adds a post and it appears in findAll", () => {
    const before = postStore.findAll(1, 100).total;
    const post = postStore.create({ title: "Test", body: "Body", author: "Tester" });
    const after = postStore.findAll(1, 100).total;
    expect(after).toBe(before + 1);
    expect(postStore.findById(post.id)).toBeDefined();
  });

  it("findById returns the correct post", () => {
    const post = postStore.create({ title: "FindMe", body: "Body", author: "X" });
    const found = postStore.findById(post.id);
    expect(found?.title).toBe("FindMe");
  });

  it("findById returns undefined for unknown id", () => {
    expect(postStore.findById("does-not-exist")).toBeUndefined();
  });

  it("update modifies fields and preserves unchanged ones", () => {
    const post = postStore.create({ title: "Original", body: "Body", author: "A" });
    const updated = postStore.update(post.id, { title: "Updated" });
    expect(updated?.title).toBe("Updated");
    expect(updated?.body).toBe("Body");
    expect(updated?.author).toBe("A");
    expect(() => new Date(updated!.updatedAt).toISOString()).not.toThrow();
  });

  it("update returns null for unknown id", () => {
    expect(postStore.update("no-id", { title: "X" })).toBeNull();
  });

  it("delete removes the post", () => {
    const post = postStore.create({ title: "Delete Me", body: "Body", author: "A" });
    expect(postStore.delete(post.id)).toBe(true);
    expect(postStore.findById(post.id)).toBeUndefined();
  });

  it("delete returns false for unknown id", () => {
    expect(postStore.delete("no-id")).toBe(false);
  });
});
