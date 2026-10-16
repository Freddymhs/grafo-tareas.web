import { test, expect } from "@playwright/test";

test.describe("Posts list", () => {
  test("loads posts without loading spinner (SSR prefetch)", async ({ page }) => {
    await page.goto("/posts");
    // No spinner should be visible — data is already in cache from server prefetch
    await expect(page.getByText("Loading posts…")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  });

  test("shows post items", async ({ page }) => {
    await page.goto("/posts");
    const links = page.locator("a[href^='/posts/']").filter({ hasNot: page.locator("nav") });
    await expect(links.first()).toBeVisible();
  });

  test("navigates to post detail on click", async ({ page }) => {
    await page.goto("/posts");
    const first = page.locator("a[href^='/posts/']").nth(1);
    await first.click();
    await expect(page).toHaveURL(/\/posts\/.+/);
  });
});

test.describe("Create post + cache invalidation", () => {
  test("creates a post and it appears in the list", async ({ page }) => {
    const title = `E2e Post ${Date.now()}`;

    await page.goto("/posts/create");
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Author").fill("E2e Tester");
    await page.getByLabel("Body").fill("Created from Playwright");
    await page.getByRole("button", { name: "Create post" }).click();

    // Should redirect to the new post's detail page
    await expect(page).toHaveURL(/\/posts\/.+/);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 10_000 });
  });
});
