import { PostResponseSchema, PostsResponseSchema } from "@/lib/schemas/post";
import type { CreatePostInput, Post, PostsResponse, UpdatePostInput } from "@/lib/schemas/post";
import type { ListParams } from "@/lib/query-keys";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";

const BASE = "/api/posts";

export async function fetchPosts(params: ListParams = {}): Promise<PostsResponse> {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = params;
  const url = `${BASE}?page=${page}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchPosts failed: ${res.status}`);
  return PostsResponseSchema.parse(await res.json());
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${BASE}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchPost failed: ${res.status}`);
  const { data } = PostResponseSchema.parse(await res.json());
  return data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`createPost failed: ${res.status}`);
  const { data } = PostResponseSchema.parse(await res.json());
  return data;
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`updatePost failed: ${res.status}`);
  const { data } = PostResponseSchema.parse(await res.json());
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deletePost failed: ${res.status}`);
}
