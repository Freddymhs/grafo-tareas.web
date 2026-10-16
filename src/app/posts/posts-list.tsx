"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { postKeys } from "@/lib/query-keys";
import { fetchPosts } from "@/lib/api/posts";
import { formatDate } from "@/lib/utils";

export function PostsList() {
  // Cache is already populated by the server prefetch — no loading flash on first render
  const { data, isLoading, isError, error } = useQuery({
    queryKey: postKeys.list({}),
    queryFn: () => fetchPosts(),
  });

  if (isLoading) {
    return <div className="animate-pulse text-gray-400 py-8 text-center">Loading posts…</div>;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error.message}
      </div>
    );
  }

  const posts = data?.data ?? [];

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block p-5 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">{post.title}</h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.body}</p>
            </div>
            <div className="text-right text-xs text-gray-400 shrink-0">
              <p>{post.author}</p>
              <p>{formatDate(post.createdAt)}</p>
            </div>
          </div>
        </Link>
      ))}

      <p className="text-xs text-gray-400 pt-2">
        {data?.total} total · page {data?.page} · limit {data?.limit}
      </p>
    </div>
  );
}
