import { test, expect } from "@playwright/test";

test.describe("API /api/posts", () => {
  test("GET returns paginated list", async ({ request }) => {
    const res = await request.get("/api/posts?page=1&limit=5");
    expect(res.ok()).toBe(true);
    const data = await res.json();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(5);
    expect(typeof data.total).toBe("number");
    expect(data.page).toBe(1);
  });

  test("POST creates a post", async ({ request }) => {
    const res = await request.post("/api/posts", {
      data: { title: "API Test Post", body: "Via Playwright", author: "Playwright" },
    });
    expect(res.status()).toBe(201);
    const { data } = await res.json();
    expect(data.title).toBe("API Test Post");
    expect(data.id).toBeDefined();
  });

  test("POST returns 422 for invalid body", async ({ request }) => {
    const res = await request.post("/api/posts", { data: { title: "" } });
    expect(res.status()).toBe(422);
  });

  test("GET /api/posts/:id returns a single post", async ({ request }) => {
    // Create a post first so this test is independent of store state
    const created = await request.post("/api/posts", {
      data: { title: "GET by ID Test", body: "Body", author: "Tester" },
    });
    const { data: newPost } = await created.json();

    const res = await request.get(`/api/posts/${newPost.id}`);
    expect(res.ok()).toBe(true);
    const { data: post } = await res.json();
    expect(post.id).toBe(newPost.id);
  });

  test("GET /api/posts/:id returns 404 for unknown id", async ({ request }) => {
    const res = await request.get("/api/posts/00000000-0000-0000-0000-000000000000");
    expect(res.status()).toBe(404);
  });

  test("DELETE removes a post", async ({ request }) => {
    const created = await request.post("/api/posts", {
      data: { title: "To Delete", body: "Body", author: "Test" },
    });
    const { data } = await created.json();

    const del = await request.delete(`/api/posts/${data.id}`);
    expect(del.status()).toBe(204);

    const get = await request.get(`/api/posts/${data.id}`);
    expect(get.status()).toBe(404);
  });
});
