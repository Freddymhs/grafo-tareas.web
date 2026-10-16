import { test, expect } from "@playwright/test";

test.describe("Table page", () => {
  test("renders table with rows", async ({ page }) => {
    await page.goto("/table");
    await expect(page.getByRole("heading", { name: "Table" })).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  test("global filter reduces visible rows", async ({ page, request }) => {
    // Create a post with a unique author so the filter result is deterministic
    // regardless of what other tests have added or deleted from the store
    await request.post("/api/posts", {
      data: { title: "Filter Test", body: "Body", author: "UniqueFilterAuthor" },
    });

    await page.goto("/table");
    await page.getByTestId("table-filter").fill("UniqueFilterAuthor");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
  });

  test("clicking a column header sorts it", async ({ page }) => {
    await page.goto("/table");
    const authorHeader = page.getByRole("columnheader", { name: /Author/ });
    await authorHeader.click();
    await expect(authorHeader).toContainText("↑");
    await authorHeader.click();
    await expect(authorHeader).toContainText("↓");
  });

  test("pagination next/prev works", async ({ page }) => {
    await page.goto("/table");
    const nextBtn = page.getByRole("button", { name: "→" });
    const prevBtn = page.getByRole("button", { name: "←" });

    await expect(prevBtn).toBeDisabled();
    await nextBtn.click();
    await expect(prevBtn).not.toBeDisabled();
    await prevBtn.click();
    await expect(prevBtn).toBeDisabled();
  });
});
