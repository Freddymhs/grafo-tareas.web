import { z } from "zod";

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  author: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PostsResponseSchema = z.object({
  data: z.array(PostSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export const PostResponseSchema = z.object({
  data: PostSchema,
});

export const CreatePostInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  body: z.string().min(1, "Body is required").max(2000),
  author: z.string().min(1, "Author is required").max(80),
});

export const UpdatePostInputSchema = CreatePostInputSchema.partial();

export type Post = z.infer<typeof PostSchema>;
export type PostsResponse = z.infer<typeof PostsResponseSchema>;
export type PostResponse = z.infer<typeof PostResponseSchema>;
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostInputSchema>;
