import { randomUUID } from "crypto";
import type { Post } from "@/lib/schemas/post";

const seed = (): Post[] => {
  const authors = ["Alice", "Bob", "Carol", "Dave", "Eve"];
  return Array.from({ length: 20 }, (_, i) => {
    const now = new Date(Date.now() - i * 3_600_000).toISOString();
    return {
      id: randomUUID(),
      title: `Post ${i + 1}: Getting Started with TanStack Query`,
      body: `This is the body of post ${i + 1}. TanStack Query provides powerful server-state management with caching, background refetching, and cache invalidation out of the box.`,
      author: authors[i % authors.length] as string,
      createdAt: now,
      updatedAt: now,
    };
  });
};

// Module-level store — persists between requests in dev. Not for production.
const posts: Post[] = seed();

export const postStore = {
  findAll(page: number, limit: number): { data: Post[]; total: number } {
    const start = (page - 1) * limit;
    return {
      data: posts.slice(start, start + limit),
      total: posts.length,
    };
  },

  findById(id: string): Post | undefined {
    return posts.find((p) => p.id === id);
  },

  create(input: { title: string; body: string; author: string }): Post {
    const now = new Date().toISOString();
    const post: Post = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
    posts.unshift(post);
    return post;
  },

  update(id: string, input: Partial<{ title: string; body: string; author: string }>): Post | null {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const existing = posts[index] as Post;
    const updated: Post = { ...existing, ...input, updatedAt: new Date().toISOString() };
    posts[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    posts.splice(index, 1);
    return true;
  },
};
