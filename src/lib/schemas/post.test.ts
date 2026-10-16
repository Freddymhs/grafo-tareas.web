import { describe, it, expect } from "vitest";
import { PostSchema, PostsResponseSchema, CreatePostInputSchema } from "./post";

const validPost = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Hello World",
  body: "Some content here",
  author: "Alice",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("PostSchema", () => {
  it("parses a valid post", () => {
    const result = PostSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = PostSchema.safeParse({ ...validPost, title: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects invalid uuid", () => {
    const result = PostSchema.safeParse({ ...validPost, id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("PostsResponseSchema", () => {
  it("parses a valid list response", () => {
    const result = PostsResponseSchema.safeParse({
      data: [validPost],
      total: 1,
      page: 1,
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = PostsResponseSchema.safeParse({
      data: [],
      total: -1,
      page: 1,
      limit: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe("CreatePostInputSchema", () => {
  it("accepts valid input", () => {
    const result = CreatePostInputSchema.safeParse({
      title: "My Post",
      body: "Content",
      author: "Bob",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = CreatePostInputSchema.safeParse({ title: "", body: "Content", author: "Bob" });
    expect(result.success).toBe(false);
  });

  it("rejects missing author", () => {
    const result = CreatePostInputSchema.safeParse({ title: "Title", body: "Content" });
    expect(result.success).toBe(false);
  });
});
