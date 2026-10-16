"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postKeys } from "@/lib/query-keys";
import { createPost } from "@/lib/api/posts";
import type { CreatePostInput } from "@/lib/schemas/post";

export default function CreatePostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreatePostInput>({ title: "", body: "", author: "" });

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate the list so it refetches with the new post
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      router.push(`/posts/${newPost.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold mb-2">New post</h1>
      <p className="text-gray-500 text-sm mb-8">
        <code className="bg-gray-100 px-1 rounded">useMutation</code> → POST →{" "}
        <code className="bg-gray-100 px-1 rounded">invalidateQueries</code> → list refetches
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            placeholder="Post title"
            required
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium mb-1">
            Author
          </label>
          <input
            id="author"
            type="text"
            value={form.author}
            onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">
            Body
          </label>
          <textarea
            id="body"
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
            placeholder="Write your post…"
            required
          />
        </div>

        {mutation.isError && <p className="text-red-600 text-sm">{mutation.error.message}</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? "Creating…" : "Create post"}
        </button>
      </form>
    </div>
  );
}
