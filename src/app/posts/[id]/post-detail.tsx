"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postKeys } from "@/lib/query-keys";
import { fetchPost, deletePost } from "@/lib/api/posts";
import { formatDate } from "@/lib/utils";

export function PostDetail({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPost(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      router.push("/posts");
    },
  });

  if (!post) return null;

  return (
    <div className="max-w-2xl">
      <Link href="/posts" className="text-blue-500 hover:underline text-sm">
        ← Posts
      </Link>

      <article className="mt-6">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex gap-4 text-sm text-gray-400 mb-6">
          <span>{post.author}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <p className="text-gray-700 leading-relaxed">{post.body}</p>
      </article>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {deleteMutation.isPending ? "Deleting…" : "Delete post"}
        </button>
      </div>
    </div>
  );
}
