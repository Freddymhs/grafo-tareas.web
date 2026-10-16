import { NextResponse } from "next/server";
import { postStore } from "@/lib/store/posts";
import { CreatePostInputSchema } from "@/lib/schemas/post";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? DEFAULT_PAGE));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_LIMIT)));

  const { data, total } = postStore.findAll(page, limit);
  return NextResponse.json({ data, total, page, limit });
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = CreatePostInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const post = postStore.create(parsed.data);
  return NextResponse.json({ data: post }, { status: 201 });
}
