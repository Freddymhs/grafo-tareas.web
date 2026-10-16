import { NextResponse } from "next/server";
import { postStore } from "@/lib/store/posts";
import { UpdatePostInputSchema } from "@/lib/schemas/post";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const post = postStore.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body: unknown = await request.json();
  const parsed = UpdatePostInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const post = postStore.update(id, parsed.data);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: post });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const deleted = postStore.delete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
