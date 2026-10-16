import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import Link from "next/link";
import { postKeys } from "@/lib/query-keys";
import { fetchPosts } from "@/lib/api/posts";
import { PostsList } from "./posts-list";

// Server Component: prefetch data so the client cache is already populated
export default async function PostsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: postKeys.list({}),
    queryFn: () => fetchPosts(),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-gray-500 text-sm mt-1">
            SSR prefetch → <code className="bg-gray-100 px-1 rounded">HydrationBoundary</code> →{" "}
            <code className="bg-gray-100 px-1 rounded">useQuery</code>
          </p>
        </div>
        <Link
          href="/posts/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          New post
        </Link>
      </div>

      {/* Transfer the prefetched cache to the client */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PostsList />
      </HydrationBoundary>
    </div>
  );
}
