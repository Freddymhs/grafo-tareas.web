import { describe, it, expect } from "vitest";
import { postKeys } from "./query-keys";

describe("postKeys", () => {
  it("all is ['posts']", () => {
    expect(postKeys.all).toEqual(["posts"]);
  });

  it("lists() includes 'list'", () => {
    expect(postKeys.lists()).toEqual(["posts", "list"]);
  });

  it("list() appends params", () => {
    expect(postKeys.list({ page: 2, limit: 5 })).toEqual(["posts", "list", { page: 2, limit: 5 }]);
  });

  it("detail() is scoped under details()", () => {
    const key = postKeys.detail("abc-123");
    expect(key).toEqual(["posts", "detail", "abc-123"]);
  });

  it("list keys are distinct from detail keys", () => {
    const list = postKeys.lists();
    const detail = postKeys.details();
    expect(list[1]).toBe("list");
    expect(detail[1]).toBe("detail");
  });
});
