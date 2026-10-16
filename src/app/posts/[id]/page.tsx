import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { postKeys } from "@/lib/query-keys";
import { fetchPost } from "@/lib/api/posts";
import { PostDetail } from "./post-detail";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const queryClient = new QueryClient();

  // Prefetch the post — errors are swallowed by prefetchQuery (client will retry)
  await queryClient.prefetchQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPost(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostDetail id={id} />
    </HydrationBoundary>
  );
}
